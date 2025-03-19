import { useState, useEffect } from 'react';
import { Divider, Tabs, Tab } from '@mui/material';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import messages from '../constants/message.json';
import { toast } from 'react-toastify';

const PointVoucherBox = ({ userInfo }) => {
    const { refetchUserData } = useAuth();
    const [currentPoint, setCurrentPoint] = useState(0);
    const [vouchers, setVouchers] = useState([]);
    const [storeVouchers, setStoreVouchers] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isStoreLoading, setIsStoreLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!userInfo?.id) return;
            
            setIsLoading(true);
            try {
                // Fetch user wallet data
                const response = await axios.get(`/api/user/${userInfo.id}`);
                setCurrentPoint(response.data.wallet || 0);

                // Fetch voucher details if available
                if (userInfo?.voucherStorage) {
                    const voucherPromises = userInfo.voucherStorage.map(async (storage) => {
                        const voucherResponse = await axios.get(`/api/voucher/${storage.voucherId}`);
                        return {
                            ...voucherResponse.data,
                            quantity: storage.quantity
                        };
                    });

                    const voucherDetails = await Promise.all(voucherPromises);
                    const activeVouchers = voucherDetails
                        .filter(voucher => voucher.status)
                        .sort((a, b) => b.discountPercentage - a.discountPercentage);
                    
                    setVouchers(activeVouchers);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error(messages.error.server);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userInfo?.id, userInfo?.voucherStorage]);

    useEffect(() => {
        const fetchStoreVouchers = async () => {
            setIsStoreLoading(true);
            try {
                const response = await axios.get('/api/voucher');
                const activeVouchers = response.data
                    .filter(voucher => voucher.status)
                    .map(voucher => ({
                        ...voucher,
                        canBuy: currentPoint >= voucher.value
                    }))
                    .sort((a, b) => {
                        // Sort by ability to buy first
                        if (a.canBuy !== b.canBuy) {
                            return b.canBuy ? 1 : -1;
                        }
                        // Then by discount percentage
                        return b.discountPercentage - a.discountPercentage;
                    });
                
                setStoreVouchers(activeVouchers);
            } catch (error) {
                console.error('Error fetching store vouchers:', error);
                toast.error(messages.error.vouchers.load);
            } finally {
                setIsStoreLoading(false);
            }
        };

        fetchStoreVouchers();
    }, [currentPoint]); // Refetch when points change to update buyable status

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleBuyVoucher = async (voucherId) => {
        if (!userInfo?.voucherStorageId) {
            toast.error('Unable to process purchase. Please try again later.');
            return;
        }

        setIsPurchasing(true);
        try {
            await axios.post('/api/storage', {
                voucherId: voucherId,
                voucherStorageId: userInfo.voucherStorageId
            });
            
            toast.success('Voucher purchased successfully!');
            
            // First refresh user data from context
            await refetchUserData();
            
            // Then fetch updated user data and vouchers
            const userResponse = await axios.get(`/api/user/${userInfo.id}`);
            setCurrentPoint(userResponse.data.wallet || 0);

            if (userInfo?.voucherStorage) {
                const voucherPromises = userInfo.voucherStorage.map(async (storage) => {
                    const voucherResponse = await axios.get(`/api/voucher/${storage.voucherId}`);
                    return {
                        ...voucherResponse.data,
                        quantity: storage.quantity
                    };
                });

                const voucherDetails = await Promise.all(voucherPromises);
                const activeVouchers = voucherDetails
                    .filter(voucher => voucher.status)
                    .sort((a, b) => b.discountPercentage - a.discountPercentage);
                
                setVouchers(activeVouchers);
            }
            
            // Refresh store vouchers
            const storeResponse = await axios.get('/api/voucher');
            const activeStoreVouchers = storeResponse.data
                .filter(voucher => voucher.status)
                .map(voucher => ({
                    ...voucher,
                    canBuy: userResponse.data.wallet >= voucher.value // Use new point balance
                }))
                .sort((a, b) => {
                    if (a.canBuy !== b.canBuy) {
                        return b.canBuy ? 1 : -1;
                    }
                    return b.discountPercentage - a.discountPercentage;
                });
            
            setStoreVouchers(activeStoreVouchers);
        } catch (error) {
            console.error('Error purchasing voucher:', error);
            toast.error(messages.error.vouchers.purchase);
        } finally {
            setIsPurchasing(false);
        }
    };

    const TabPanel = ({ children, value, index }) => {
        return (
            <div hidden={value !== index} className="mt-4">
                {value === index && children}
            </div>
        );
    };

    return ( 
        <main className="p-4 bg-gray-50">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-center mb-7">Points & Vouchers</h1>
            <div className="bg-white shadow-lg rounded-lg p-4 min-h-[calc(100vh-6rem)]">
                <div className="space-y-4">
                    {/* Points Section */}
                    <div className="space-y-2">
                        <h2 className='text-2xl font-semibold'>Your Points</h2>
                        <Divider />
                        <div className="py-4">
                            <span className="text-4xl font-bold text-[#E91E63]">
                                {currentPoint.toLocaleString()}
                            </span>
                            <span className="text-gray-600 ml-2">points</span>
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <div>
                        <Tabs 
                            value={currentTab} 
                            onChange={handleTabChange}
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{
                                '& .MuiTab-root': { 
                                    color: '#757575',
                                    '&.Mui-selected': { color: '#E91E63' }
                                },
                                '& .MuiTabs-indicator': { backgroundColor: '#E91E63' }
                            }}
                        >
                            <Tab label="My Vouchers" />
                            <Tab label="Voucher Store" />
                        </Tabs>

                        {/* My Vouchers Tab */}
                        <TabPanel value={currentTab} index={0}>
                            {isLoading ? (
                                <p className="text-gray-500 text-center py-4">Loading vouchers...</p>
                            ) : vouchers.length > 0 ? (
                                <div className="grid grid-cols-3 gap-4">
                                    {vouchers.map((voucher) => (
                                        <div
                                            key={voucher.id}
                                            className="p-3 border-2 rounded-lg border-[#E91E63] bg-pink-50/30 hover:bg-pink-50 transition-colors"
                                        >
                                            <div className="flex flex-col h-full">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-semibold text-lg text-[#E91E63]">
                                                        {voucher.discountPercentage}% OFF
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500 mb-1">
                                                    ({voucher.quantity} remaining)
                                                </div>
                                                <p className="text-xs text-gray-600">
                                                    Min. spend ${voucher.minimumPurchase}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-auto pt-2">
                                                    Cost: {voucher.value} points
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    You don't have any vouchers yet
                                </p>
                            )}
                        </TabPanel>

                        {/* Voucher Store Tab */}
                        <TabPanel value={currentTab} index={1}>
                            {isStoreLoading ? (
                                <p className="text-gray-500 text-center py-4">Loading store vouchers...</p>
                            ) : storeVouchers.length > 0 ? (
                                <div className="grid grid-cols-3 gap-4">
                                    {storeVouchers.map((voucher) => (
                                        <div
                                            key={voucher.id}
                                            className={`relative p-3 rounded-lg shadow-md transition-all ${
                                                voucher.canBuy 
                                                    ? 'bg-white hover:shadow-lg hover:-translate-y-0.5'
                                                    : 'bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex flex-col h-full">
                                                {/* Price Tag */}
                                                <div className="absolute -top-2 -right-2 bg-[#E91E63] text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                                                    {voucher.value} pts
                                                </div>

                                                {/* Main Content */}
                                                <div className="mt-3">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="font-bold text-2xl text-[#E91E63]">
                                                            {voucher.discountPercentage}%
                                                        </span>
                                                        <span className="font-medium text-gray-600">
                                                            DISCOUNT
                                                        </span>
                                                    </div>
                                                    <div className="bg-pink-50 rounded-md p-2 mb-3">
                                                        <p className="text-xs text-gray-600">
                                                            Minimum purchase:
                                                            <span className="font-medium ml-1 text-gray-800">
                                                                ${voucher.minimumPurchase}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Button */}
                                                <button
                                                    onClick={() => handleBuyVoucher(voucher.id)}
                                                    disabled={!voucher.canBuy || isPurchasing}
                                                    className={`w-full py-2 rounded-md text-sm font-medium transition-colors mt-auto ${
                                                        voucher.canBuy
                                                            ? isPurchasing
                                                                ? 'bg-gray-300 text-gray-600 cursor-wait'
                                                                : 'bg-[#E91E63] text-white hover:bg-[#D81B60]'
                                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {isPurchasing 
                                                        ? 'Purchasing...' 
                                                        : voucher.canBuy 
                                                            ? 'Buy Voucher' 
                                                            : 'Not Enough Points'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    No vouchers available in store
                                </p>
                            )}
                        </TabPanel>
                    </div>
                </div>
            </div>
        </main>
    );
}
 
export default PointVoucherBox;