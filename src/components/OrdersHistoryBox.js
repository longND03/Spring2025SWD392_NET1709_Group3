import {Divider} from '@mui/material';


const OrdersHistoryBox = ({ userInfo }) => {
  return (
    <main className="p-6 bg-gray-50">
      <h1 className="text-7xl font-bold mb-6 text-center text-[#E91E63]">Orders History</h1>
      <div className="bg-white shadow-lg rounded-lg p-8 min-h-[calc(100vh-10rem)]">
        <div className="space-y-4">
          <h2 className='text-4xl font-semibold'>hisotry....</h2>
          <Divider />
          
        </div>
      </div>
    </main>
  );
};

export default OrdersHistoryBox; 