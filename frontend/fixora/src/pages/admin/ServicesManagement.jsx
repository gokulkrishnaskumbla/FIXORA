import React, { useEffect, useState } from 'react';
import { listServices, createService, updateService, deleteService } from '../../assistance/adminAssistance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    price: '',
    image: null,
    category: 'others',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await listServices();
      setServices(response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('duration', formData.duration);
      data.append('price', formData.price);
      data.append('category', formData.category || 'others');
      if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingService) {
        await updateService(editingService._id, data);
        toast.success('Service updated successfully');
      } else {
        await createService(data);
        toast.success('Service created successfully');
      }

  setShowModal(false);
  setEditingService(null);
  setFormData({ title: '', description: '', duration: '', price: '', image: null, category: 'others' });
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.response?.data?.error || 'Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      duration: service.duration,
      price: service.price,
      image: null,
      category: service.category || 'others',
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await deleteService(serviceId);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ToastContainer position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-base-content">Services Management</h1>
        <button
          onClick={() => {
              setEditingService(null);
              setFormData({ title: '', description: '', duration: '', price: '', image: null, category: 'others' });
              setShowModal(true);
            }}
          className="btn btn-primary"
        >
          Add New Service
        </button>
      </div>

      {/* Services Table */}
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id}>
                <td>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="font-semibold">{service.title}</td>
                <td className="capitalize">{service.category || 'others'}</td>
                <td className="max-w-xs truncate">{service.description}</td>
                <td>{service.duration}</td>
                <td className="font-bold text-primary">₹{service.price}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="btn btn-sm btn-info"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered"
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Duration</span>
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  placeholder="e.g., 2 hours"
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Price (₹)</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Image</span>
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  className="file-input file-input-bordered"
                  accept="image/*"
                  required={!editingService}
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="select select-bordered">
                  <option value="plumbing">plumbing</option>
                  <option value="cleaning">cleaning</option>
                  <option value="electrical">electrical</option>
                  <option value="carpenter">carpenter</option>
                  <option value="appliance">appliance</option>
                  <option value="saloon">saloon</option>
                  <option value="others">others</option>
                </select>
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingService(null);
                  }}
                  className="btn"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

