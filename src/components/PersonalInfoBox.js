import { Divider } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { FaPencilAlt, FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import messages from '../constants/message.json';

const PersonalInfoBox = ({ userInfo }) => {
  const { setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [addressDisplay, setAddressDisplay] = useState({
    specificAddress: 'N/A',
    provinceName: 'N/A',
    districtName: 'N/A',
    wardName: 'N/A'
  });

  const [errors, setErrors] = useState({});

  const [editedInfo, setEditedInfo] = useState({
    username: userInfo?.username || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || ''
  });

  const [editedShipping, setEditedShipping] = useState({
    specificAddress: '',
    province: '',
    district: '',
    ward: ''
  });

  // Parse shipping info and fetch data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      if (userInfo?.location) {
        const [specificAddress, wardCode, districtCode, provinceCode] = userInfo.location.split('|');
        
        // Set form data for editing
        setEditedShipping({
          specificAddress,
          province: provinceCode,
          district: districtCode,
          ward: wardCode
        });

        try {
          // Fetch provinces and resolve province name
          const provinceResponse = await fetch('https://provinces.open-api.vn/api/p/');
          const provinceData = await provinceResponse.json();
          setProvinces(provinceData);
          const provinceName = provinceData.find(p => p.code.toString() === provinceCode.toString())?.name || '';

          // Fetch districts and resolve district name
          let districtName = '';
          let wardName = '';
          
          if (provinceCode) {
            const districtResponse = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const districtData = await districtResponse.json();
            if (districtData && districtData.districts) {
              setDistricts(districtData.districts);
              districtName = districtData.districts.find(d => d.code.toString() === districtCode.toString())?.name || '';
            }

            // Fetch wards and resolve ward name
            if (districtCode) {
              const wardResponse = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
              const wardData = await wardResponse.json();
              if (wardData && wardData.wards) {
                setWards(wardData.wards);
                wardName = wardData.wards.find(w => w.code.toString() === wardCode.toString())?.name || '';
              }
            }
          }

          // Set all display values at once
          setAddressDisplay({
            specificAddress,
            provinceName,
            districtName,
            wardName
          });

        } catch (error) {
          console.error('Error fetching address data:', error);
          // Set display values to indicate error
          setAddressDisplay({
            specificAddress,
            provinceName: 'Error loading',
            districtName: 'Error loading',
            wardName: 'Error loading'
          });
        }
      }
    };

    fetchInitialData();
  }, [userInfo]);

  // Keep the provinces fetch for the edit form
  useEffect(() => {
    const fetchProvinces = async () => {
      if (provinces.length === 0) {
        try {
          const response = await fetch('https://provinces.open-api.vn/api/p/');
          const data = await response.json();
          setProvinces(data);
        } catch (error) {
          console.error('Error fetching provinces:', error);
        }
      }
    };
    fetchProvinces();
  }, [provinces.length]);

  // Keep these effects for the edit form
  useEffect(() => {
    const fetchDistricts = async () => {
      if (editedShipping.province) {
        try {
          const response = await fetch(`https://provinces.open-api.vn/api/p/${editedShipping.province}?depth=2`);
          const data = await response.json();
          if (data && data.districts) {
            setDistricts(data.districts);
          }
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      } else {
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [editedShipping.province]);

  useEffect(() => {
    const fetchWards = async () => {
      if (editedShipping.district) {
        try {
          const response = await fetch(`https://provinces.open-api.vn/api/d/${editedShipping.district}?depth=2`);
          const data = await response.json();
          if (data && data.wards) {
            setWards(data.wards);
          }
        } catch (error) {
          console.error('Error fetching wards:', error);
        }
      } else {
        setWards([]);
      }
    };
    fetchWards();
  }, [editedShipping.district]);

  const validateForm = () => {
    const newErrors = {};
    if (!editedInfo.username.trim()) {
      newErrors.username = messages.validation.required.username;
    }
    if (!editedInfo.email.trim()) {
      newErrors.email = messages.validation.required.email;
    } else if (!/\S+@\S+\.\S+/.test(editedInfo.email)) {
      newErrors.email = messages.validation.invalid.email;
    }
    if (!editedInfo.phone.trim()) {
      newErrors.phone = messages.validation.required.phone;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateShippingForm = () => {
    const newErrors = {};
    if (!editedShipping.specificAddress.trim()) {
      newErrors.specificAddress = messages.validation.required.address.specific;
    }
    if (!editedShipping.province) {
      newErrors.province = messages.validation.required.address.province;
    }
    if (!editedShipping.district) {
      newErrors.district = messages.validation.required.address.district;
    }
    if (!editedShipping.ward) {
      newErrors.ward = messages.validation.required.address.ward;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo({
      username: userInfo?.username || '',
      email: userInfo?.email || '',
      phone: userInfo?.phone || ''
    });
  };

  const handleEditShipping = () => {
    setIsEditingShipping(true);
    if (userInfo?.location) {
      const [specificAddress, wardCode, districtCode, provinceCode] = userInfo.location.split('|');
      setEditedShipping({
        specificAddress,
        province: provinceCode,
        district: districtCode,
        ward: wardCode
      });
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(messages.error.profile.image.size);
        return;
      }

      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      const imageResponse = await axios.post(`/api/image/profile/${userInfo.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (imageResponse.status === 200) {
        const updatedUser = {
          ...userInfo,
          image: imageResponse.data.imageUrl
        };
        setUser(updatedUser);
        setSelectedImage(null);
        setPreviewImage(null);
        toast.success(messages.success.profilePicture);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(messages.error.profile.image.upload);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.put(`/api/user/${userInfo.id}`, editedInfo);
      
      if (response.status === 200) {
        const updatedUser = {
          ...userInfo,
          ...editedInfo
        };
        setUser(updatedUser);
        
        setIsEditing(false);
        toast.success(messages.success.updateProfile);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(messages.error.profile.update);
    }
  };

  const handleSaveShipping = async () => {
    if (!validateShippingForm()) {
      return;
    }

    try {
      const locationString = `${editedShipping.specificAddress}|${editedShipping.ward}|${editedShipping.district}|${editedShipping.province}`;
      
      const response = await axios.put(`/api/user/${userInfo.id}`, {
        location: locationString
      });

      if (response.status === 200) {
        const updatedUser = {
          ...userInfo,
          location: locationString
        };
        setUser(updatedUser);

        setIsEditingShipping(false);
        toast.success(messages.success.updateShipping);
      }
    } catch (error) {
      console.error('Error updating shipping info:', error);
      toast.error(messages.error.profile.shipping);
    }
  };

  const handleChange = (field, value) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleShippingChange = (field, value) => {
    setEditedShipping(prev => {
      const newState = {
        ...prev,
        [field]: value
      };
      
      // Reset dependent fields when province or district changes
      if (field === 'province') {
        newState.district = '';
        newState.ward = '';
      } else if (field === 'district') {
        newState.ward = '';
      }
      
      return newState;
    });
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <main className="p-4 bg-gray-50">
      <h1 className="text-4xl font-bold mb-4 text-center text-[#E91E63]">Profile</h1>
      <div className="bg-white shadow-lg rounded-lg p-4 min-h-[calc(100vh-6rem)]">
        <div className="space-y-4">
          {/* Personal Information Section */}
          <div className="space-y-2 mb-16">
            <div className="flex justify-between items-center">
              <h2 className='text-2xl font-semibold'>Personal Information</h2>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1 text-[#E91E63] hover:text-[#D81B60] px-2 py-1 rounded-md border border-[#E91E63] hover:bg-pink-50 transition-colors text-sm"
                >
                  <FaPencilAlt className="text-sm" /> Edit Profile
                </button>
              )}
            </div>
            <Divider />
            <div className='flex items-center w-full'>
              <div className='text-left w-1/2'>
                {!isEditing ? (
                  <div className="space-y-2">
                    <p className="text-base flex">
                      <span className="font-semibold w-32">Name:</span>
                      <span className="font-normal">{userInfo?.username || 'N/A'}</span>
                    </p>
                    <p className="text-base flex">
                      <span className="font-semibold w-32">Email:</span>
                      <span className="font-normal">{userInfo?.email || 'N/A'}</span>
                    </p>
                    <p className="text-base flex">
                      <span className="font-semibold w-32">Phone:</span>
                      <span className="font-normal">{userInfo?.phone || 'N/A'}</span>
                    </p>
                  </div>
                ) : (
                  <form className="space-y-4 max-w-md">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 font-medium whitespace-nowrap w-[8rem]">
                        Name:
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={editedInfo.username}
                          onChange={(e) => handleChange('username', e.target.value)}
                          className={`w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm
                            ${errors.username ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-gray-300'}`}
                        />
                        {errors.username && (
                          <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 font-medium whitespace-nowrap w-[8rem]">
                        Email:
                      </label>
                      <div className="flex-1">
                        <input
                          type="email"
                          value={editedInfo.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className={`w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm
                            ${errors.email ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-gray-300'}`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 font-medium whitespace-nowrap w-[8rem]">
                        Phone:
                      </label>
                      <div className="flex-1">
                        <input
                          type="tel"
                          value={editedInfo.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          className={`w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm
                            ${errors.phone ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-gray-300'}`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={handleSave}
                        className="flex-1 bg-[#E91E63] text-white py-1.5 px-3 rounded-md hover:bg-[#D81B60] transition-colors duration-200 text-sm"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedImage(null);
                          setPreviewImage(null);
                        }}
                        className="flex-1 border border-gray-300 text-gray-700 py-1.5 px-3 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
              <div className='flex flex-col items-center w-1/2 gap-4'>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={handleImageClick}
                  className={`relative ${isEditing ? 'cursor-pointer group' : ''}`}
                >
                  {previewImage || userInfo?.image ? (
                    <img
                      src={previewImage || userInfo?.image}
                      alt="User Avatar"
                      className={`w-40 h-40 rounded-full object-cover ${
                        isEditing ? 'transition-opacity group-hover:opacity-70' : ''
                      }`}
                    />
                  ) : (
                    <div className={`w-32 h-32 text-5xl rounded-full bg-[#E91E63] flex items-center justify-center text-white ${
                      isEditing ? 'transition-opacity group-hover:opacity-70' : ''
                    }`}>
                      {userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <FaCamera className="text-4xl text-white" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={!selectedImage}
                      className={`py-2 px-6 rounded-md transition-colors duration-200 text-sm flex items-center gap-2
                        ${selectedImage 
                          ? 'bg-[#E91E63] hover:bg-[#D81B60] text-white cursor-pointer' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                    >
                      <FaCamera className="text-sm" /> Upload Image
                    </button>
                    <p className="text-xs text-gray-500">
                      {selectedImage ? 'Click to upload your new profile picture' : 'Click on the avatar to select an image'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Information Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className='text-2xl font-semibold'>Shipping Information</h2>
              {!isEditingShipping && (
                <button
                  onClick={handleEditShipping}
                  className="flex items-center gap-1 text-[#E91E63] hover:text-[#D81B60] px-2 py-1 rounded-md border border-[#E91E63] hover:bg-pink-50 transition-colors text-sm"
                >
                  <FaPencilAlt className="text-sm" /> Edit Shipping Info
                </button>
              )}
            </div>
            <Divider />
            <div className='w-full'>
              {!isEditingShipping ? (
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <label className="text-base font-semibold whitespace-nowrap w-[8rem]">
                      Specific Address:
                    </label>
                    <div>
                      {addressDisplay.specificAddress}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-base font-semibold mb-1">
                        Province
                      </label>
                      <div>
                        {addressDisplay.provinceName}
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-semibold mb-1">
                        District
                      </label>
                      <div>
                        {addressDisplay.districtName}
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-semibold mb-1">
                        Ward
                      </label>
                      <div>
                        {addressDisplay.wardName}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <label className="text-base font-medium whitespace-nowrap w-[8rem]">
                      Specific Address:
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editedShipping.specificAddress}
                        onChange={(e) => handleShippingChange('specificAddress', e.target.value)}
                        placeholder="House number, Street name"
                        className={`w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm
                          ${errors.specificAddress ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-gray-300'}`}
                      />
                      {errors.specificAddress && (
                        <p className="text-red-500 text-xs mt-1">{errors.specificAddress}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-base font-medium mb-1">
                        Province
                      </label>
                      <select
                        value={editedShipping.province}
                        onChange={(e) => handleShippingChange('province', e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm
                          ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select Province</option>
                        {provinces.map(province => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                      {errors.province && (
                        <p className="text-red-500 text-xs mt-1">{errors.province}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-base font-medium mb-1">
                        District
                      </label>
                      <select
                        value={editedShipping.district}
                        onChange={(e) => handleShippingChange('district', e.target.value)}
                        disabled={!editedShipping.province}
                        className={`w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm
                          ${errors.district ? 'border-red-500' : 'border-gray-300'}
                          disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      >
                        <option value="">Select District</option>
                        {districts.map(district => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                      {errors.district && (
                        <p className="text-red-500 text-xs mt-1">{errors.district}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-base font-medium mb-1">
                        Ward
                      </label>
                      <select
                        value={editedShipping.ward}
                        onChange={(e) => handleShippingChange('ward', e.target.value)}
                        disabled={!editedShipping.district}
                        className={`w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm
                          ${errors.ward ? 'border-red-500' : 'border-gray-300'}
                          disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      >
                        <option value="">Select Ward</option>
                        {wards.map(ward => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                      {errors.ward && (
                        <p className="text-red-500 text-xs mt-1">{errors.ward}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={handleSaveShipping}
                      className="flex-1 bg-[#E91E63] text-white py-1.5 px-3 rounded-md hover:bg-[#D81B60] transition-colors duration-200 text-sm"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingShipping(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-1.5 px-3 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PersonalInfoBox; 