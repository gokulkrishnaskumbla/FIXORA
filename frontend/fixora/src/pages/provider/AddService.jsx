import React, { useState } from 'react';
import { createProviderService } from '../../assistance/providerAssistance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

export default function AddService() {
  const [form, setForm] = useState({ title: '', description: '', duration: '', price: '', category: 'others' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
  fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('duration', form.duration);
    fd.append('price', form.price);
  fd.append('category', form.category);
    if (image) fd.append('image', image);

    try {
      setLoading(true);
      const res = await createProviderService(fd);
      toast.success(res.data?.message || 'Service added', { position: 'top-right' });
      setTimeout(() => navigate('/provider/services'), 1000);
    } catch (error) {
      console.error('Add service error', error.response || error.message || error);
      toast.error(error.response?.data?.error || 'Failed to add service', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Add Service</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="input input-bordered w-full" required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="textarea textarea-bordered w-full" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Duration</label>
            <input name="duration" value={form.duration} onChange={handleChange} className="input input-bordered w-full" />
          </div>
          <div>
            <label className="label">Price</label>
            <input name="price" value={form.price} onChange={handleChange} className="input input-bordered w-full" required />
          </div>
        </div>
        <div>
          <label className="label">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="select select-bordered w-full">
            <option value="plumbing">plumbing</option>
            <option value="cleaning">cleaning</option>
            <option value="electrical">electrical</option>
            <option value="carpenter">carpenter</option>
            <option value="appliance">appliance</option>
            <option value="saloon">saloon</option>
            <option value="others">others</option>
          </select>
        </div>
        <div>
          <label className="label">Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        </div>
        <div>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Service'}</button>
        </div>
      </form>
    </div>
  );
}
