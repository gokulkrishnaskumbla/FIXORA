import React, { useEffect, useState } from 'react';
import { getAllContacts, deleteContact } from '../../assistance/adminAssistance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ContactManagement() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await getAllContacts();
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) {
      return;
    }

    try {
      await deleteContact(contactId);
      toast.success('Contact message deleted successfully');
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact message');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <h1 className="text-4xl font-bold mb-8 text-base-content">Contact Messages</h1>

      <div className="stats shadow mb-6">
        <div className="stat">
          <div className="stat-title">Total Messages</div>
          <div className="stat-value text-primary">{contacts.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacts List */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">All Messages</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="text-center py-12 text-base-content/70">No contact messages found</div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact._id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedContact?._id === contact._id
                      ? 'border-primary bg-primary/10'
                      : 'border-base-300 hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-base-content">{contact.name}</h3>
                      <p className="text-sm text-base-content/70">{contact.email}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(contact._id);
                      }}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-sm text-base-content/80 line-clamp-2">{contact.message}</p>
                  <p className="text-xs text-base-content/60 mt-2">
                    {formatDate(contact.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Message Details</h2>
          {selectedContact ? (
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Name</span>
                </label>
                <div className="input input-bordered bg-base-200">{selectedContact.name}</div>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <div className="input input-bordered bg-base-200">{selectedContact.email}</div>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Message</span>
                </label>
                <div className="textarea textarea-bordered bg-base-200 min-h-[200px]">
                  {selectedContact.message}
                </div>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Received</span>
                </label>
                <div className="input input-bordered bg-base-200">
                  {formatDate(selectedContact.createdAt)}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="btn btn-primary flex-1"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Reply via Email
                </a>
                <button
                  onClick={() => handleDelete(selectedContact._id)}
                  className="btn btn-error"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] text-base-content/50">
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p>Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



