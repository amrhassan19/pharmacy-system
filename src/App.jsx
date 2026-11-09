import { useState, useEffect, useRef, useMemo } from 'react'
import './App.css' 

const initialFormState = {
  name: '',
  price: '',
  stock: '',
  strength: '',
  expirdate: '',
  imge: null
};

function App() {
  const [medicinList, setMedicinList] = useState(() => {
      const savedMedicins = localStorage.getItem('medicins');
      return savedMedicins ? JSON.parse(savedMedicins) : [];
  });

  useEffect(() => {
      localStorage.setItem('medicins', JSON.stringify(medicinList));
  }, [medicinList]);

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const fileInputRef = useRef(null);

  const formdata = [
    { name: 'name', lable: 'Name of treatment', type: 'text', placeholder: 'Panadol' },
    { name: 'price', lable: 'Price of treatment', type: 'number', placeholder: '50 EGP' },
    { name: 'stock', lable: 'Number of pieces available', type: 'number', placeholder: '5 pieces' },
    { name: 'strength', lable: 'Strength', type: 'text', placeholder: '500mg' },
    { name: 'expirdate', lable: 'Expiry date', type: 'date', placeholder: '' },
    { name: 'imge', lable: 'Treatment photo', type: 'file', placeholder: '' },
  ];

  const filteredMedicines = useMemo(() => {
    return medicinList.filter((med) => 
      med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [medicinList, searchTerm]);

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [name]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.stock) newErrors.stock = 'Stock is required';
    if (!formData.expirdate) newErrors.expirdate = 'Expiry date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingIndex !== null) {

      if (editingIndex < 0 || editingIndex >= medicinList.length) {
        setEditingIndex(null);
        resetForm();
        return;
      }


      const updatedList = medicinList.map((med, index) => {
        if (index === editingIndex) {
          return {
            ...formData,
            imge: formData.imge || med.imge 
          };
        }
        return med;
      });

      setMedicinList(updatedList);
      setEditingIndex(null);
    } else {
      setMedicinList(prev => [...prev, formData]);
    }

    resetForm();
  };

  const handleEdit = (index) => {
    setFormData(medicinList[index]);
    setEditingIndex(index);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (indexToDelete) => {
    if (editingIndex === indexToDelete) {
      setEditingIndex(null);
      resetForm();
    } else if (editingIndex !== null && editingIndex > indexToDelete) {
      setEditingIndex(prev => prev - 1);
    }

    const updatedList = medicinList.filter((_, index) => index !== indexToDelete);
    setMedicinList(updatedList);
  };

  return (
    <div className="app-container">
      <div className="form-section">
        <h2>{editingIndex !== null ? 'Edit Medicine' : 'Add New Medicine'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {formdata.map((field) => (
              <div key={field.name} className="input-group">
                <label className="label">{field.lable}</label>
                <input 
                  type={field.type}
                  name={field.name}
                  ref={field.type === 'file' ? fileInputRef : null}
                  value={field.type === 'file' ? undefined : formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                />
                {errors[field.name] && (
                  <span className="error-message-inline">
                    {errors[field.name]}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          <div className="btn-container">
            <button type="submit" className="add-btn">
              {editingIndex !== null ? 'Update Medicine' : 'Add Medicines'}
            </button>
          </div>
        </form>
      </div>

      <div className="section-divider"></div>

      <div className="medicines-section">
        <h2>Medicines Inventory ({medicinList.length})</h2>
       
        <div className="search-box-wrapper">
          <input 
            type="text" 
            placeholder="Search medicine by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="medicines-grid">
          {filteredMedicines.map((med, index) => (
            <div key={index} className="medicine-card">
              <h3>{med.name}</h3>
              <p><strong>Price:</strong> {med.price} EGP</p>
              <p><strong>Stock:</strong> {med.stock} pcs</p>
              <p><strong>Strength:</strong> {med.strength} mg</p>
              <p><strong>Expiry:</strong> {med.expirdate}</p>
              
              {med.imge && (
                <img 
                  src={med.imge} 
                  alt="medicine" 
                />
              )}

              <div className="card-actions">
                <button 
                  type="button" 
                  onClick={() => handleEdit(index)}
                  className="edit-btn"
                >
                  Edit
                </button>
                
                <button 
                  type="button" 
                  onClick={() => handleDelete(index)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


export default App