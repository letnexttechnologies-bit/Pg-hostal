import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export default function AdminPanel() {
  const [pgs, setPGs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPG, setCurrentPG] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    gender: 'Male',
    latitude: '',
    longitude: '',
    image: '',
    stayType: 'Co-living',
    sharingType: 'Private',
    amenities: []
  });

  const amenitiesList = ['AC', 'Gym', 'Food', 'Fridge', 'Parking', 'Power Backup'];

  // Real-time listener for PGs
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'pgs'), (snapshot) => {
      const pgsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPGs(pgsData);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const pgData = {
        ...formData,
        price: Number(formData.price),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        updatedAt: serverTimestamp()
      };

      if (isEditing && currentPG) {
        // Update existing PG
        await updateDoc(doc(db, 'pgs', currentPG.id), pgData);
        alert('PG updated successfully!');
      } else {
        // Add new PG
        await addDoc(collection(db, 'pgs'), {
          ...pgData,
          createdAt: serverTimestamp(),
          isActive: true
        });
        alert('PG added successfully!');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving PG:', error);
      alert('Error saving PG: ' + error.message);
    }
  };

  const handleEdit = (pg) => {
    setIsEditing(true);
    setCurrentPG(pg);
    setFormData({
      name: pg.name,
      location: pg.location,
      price: pg.price,
      gender: pg.gender,
      latitude: pg.latitude,
      longitude: pg.longitude,
      image: pg.image,
      stayType: pg.stayType || 'Co-living',
      sharingType: pg.sharingType || 'Private',
      amenities: pg.amenities || []
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this PG?')) {
      try {
        await deleteDoc(doc(db, 'pgs', id));
        alert('PG deleted successfully!');
      } catch (error) {
        console.error('Error deleting PG:', error);
        alert('Error deleting PG: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentPG(null);
    setFormData({
      name: '',
      location: '',
      price: '',
      gender: 'Male',
      latitude: '',
      longitude: '',
      image: '',
      stayType: 'Co-living',
      sharingType: 'Private',
      amenities: []
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '30px' }}>
        Admin Panel - Manage PGs
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Form Section */}
        <div style={{ 
          background: '#fff', 
          padding: '25px', 
          borderRadius: '15px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          height: 'fit-content'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>
            {isEditing ? 'Edit PG' : 'Add New PG'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                PG Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Price (₹/month) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Stay Type *
                </label>
                <select
                  name="stayType"
                  value={formData.stayType}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                >
                  <option value="Co-living">Co-living</option>
                  <option value="Student Living">Student Living</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Sharing Type *
                </label>
                <select
                  name="sharingType"
                  value={formData.sharingType}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                >
                  <option value="Private">Private</option>
                  <option value="2 Sharing">2 Sharing</option>
                  <option value="3 Sharing">3 Sharing</option>
                  <option value="4 Sharing">4 Sharing</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Image URL *
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                required
                placeholder="https://example.com/image.jpg"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Amenities
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {amenitiesList.map(amenity => (
                  <label 
                    key={amenity}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      background: formData.amenities.includes(amenity) ? '#d4af37' : '#f0f0f0',
                      color: formData.amenities.includes(amenity) ? '#fff' : '#333',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.3s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      style={{ marginRight: '6px' }}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#d4af37',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {isEditing ? 'Update PG' : 'Add PG'}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '12px 20px',
                    background: '#666',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* PG List Section */}
        <div style={{ 
          background: '#fff', 
          padding: '25px', 
          borderRadius: '15px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>
            All PGs ({pgs.length})
          </h2>

          <div style={{ 
            display: 'grid', 
            gap: '15px',
            maxHeight: '800px',
            overflowY: 'auto'
          }}>
            {pgs.map(pg => (
              <div 
                key={pg.id}
                style={{
                  padding: '15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr auto',
                  gap: '15px',
                  alignItems: 'center'
                }}
              >
                <img 
                  src={pg.image} 
                  alt={pg.name}
                  style={{
                    width: '100px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />

                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{pg.name}</h3>
                  <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{pg.location}</p>
                  <p style={{ margin: '5px 0 0 0', color: '#d4af37', fontWeight: '700' }}>
                    ₹{pg.price?.toLocaleString()}/month
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleEdit(pg)}
                    style={{
                      padding: '8px 16px',
                      background: '#4CAF50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pg.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#f44336',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}