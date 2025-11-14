import React, { useEffect, useState } from 'react';
import { getMyServices, updateProviderService, deleteProviderService } from '../../assistance/providerAssistance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

export default function ProviderServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', duration: '', category: 'others' });
  const [editImage, setEditImage] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getMyServices();
        setServices(res.data?.services || []);
      } catch (error) {
        console.error('Failed to load provider services', error.response || error.message || error);
        toast.error(error.response?.data?.error || 'Failed to load services', { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="p-6">Loading services...</div>;

  return (
    <div className="p-6">
      <ToastContainer />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Services</h1>
        <div>
          <button className="btn btn-sm btn-outline mr-2" onClick={() => navigate('/provider/services/add')}>Add Service</button>
          <button className="btn btn-sm" onClick={() => { setLoading(true); getMyServices().then(r => setServices(r.data?.services || [])).catch(e=>console.error(e)).finally(()=>setLoading(false)); }}>Refresh</button>
        </div>
      </div>
      {services.length === 0 ? (
        <div className="text-gray-600">You have not added any services yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s._id} className="card bg-base-100 shadow p-4 relative">
              <h2 className="font-semibold">{s.title}</h2>
              <p className="text-sm text-gray-600">{s.description}</p>
              <div className="mt-2 text-sm">Price: {s.price}</div>
              <div className="mt-3 flex gap-2">
                <button className="btn btn-sm btn-secondary" onClick={() => {
                  setEditingService(s);
                  setEditForm({ title: s.title || '', description: s.description || '', price: s.price || '', duration: s.duration || '', category: s.category || 'others' });
                  setEditImage(null);
                }}>Edit</button>
                <button className={`btn btn-sm btn-error ${actionLoadingId === s._id ? 'loading' : ''}`} onClick={async () => {
                  if (!confirm('Delete this service?')) return;
                  try {
                    setActionLoadingId(s._id);
                    await deleteProviderService(s._id);
                    toast.success('Service deleted', { position: 'top-right' });
                    const res = await getMyServices();
                    setServices(res.data?.services || []);
                  } catch (err) {
                    console.error('Delete failed', err.response || err);
                    toast.error(err.response?.data?.error || 'Failed to delete', { position: 'top-right' });
                  } finally { setActionLoadingId(null); }
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-xl">
            <h2 className="text-lg font-bold mb-4">Edit Service</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                setActionLoadingId(editingService._id);
                const fd = new FormData();
                fd.append('title', editForm.title);
                fd.append('description', editForm.description);
                fd.append('price', editForm.price);
                fd.append('duration', editForm.duration);
                if (editImage) fd.append('image', editImage);
                  if (editForm.category) fd.append('category', editForm.category);
                await updateProviderService(editingService._id, fd);
                toast.success('Service updated', { position: 'top-right' });
                const res = await getMyServices();
                setServices(res.data?.services || []);
                setEditingService(null);
              } catch (err) {
                console.error('Update failed', err.response || err);
                toast.error(err.response?.data?.error || 'Failed to update', { position: 'top-right' });
              } finally { setActionLoadingId(null); }
            }}>
                <div className="grid gap-3">
                <input className="input input-bordered" name="title" value={editForm.title} onChange={(e)=>setEditForm({...editForm, title: e.target.value})} />
                <textarea className="textarea textarea-bordered" name="description" value={editForm.description} onChange={(e)=>setEditForm({...editForm, description: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                  <input className="input input-bordered" name="duration" value={editForm.duration} onChange={(e)=>setEditForm({...editForm, duration: e.target.value})} />
                  <input className="input input-bordered" name="price" value={editForm.price} onChange={(e)=>setEditForm({...editForm, price: e.target.value})} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="select select-bordered w-full" name="category" value={editForm.category} onChange={(e)=>setEditForm({...editForm, category: e.target.value})}>
                    <option value="plumbing">plumbing</option>
                    <option value="cleaning">cleaning</option>
                    <option value="electrical">electrical</option>
                    <option value="carpenter">Carpenter</option>
                    <option value="appliance">appliance</option>
                    <option value="saloon">saloon</option>
                    <option value="others">others</option>
                  </select>
                </div>
                <input type="file" accept="image/*" onChange={(e)=>setEditImage(e.target.files[0])} />
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn" onClick={()=>setEditingService(null)}>Cancel</button>
                  <button type="submit" className={`btn btn-primary ${actionLoadingId === editingService._id ? 'loading' : ''}`}>Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
