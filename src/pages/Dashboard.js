import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const userName = localStorage.getItem('fullName');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [type, setType] = useState('Material');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState({ text: '', isError: false });

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://studyshare-backend-o7jr.onrender.com/api/files', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching files repository.");
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadMsg({ text: '', isError: false });
    if (!selectedFile) {
      setUploadMsg({ text: 'Please choose a physical file to upload.', isError: true });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('courseCode', courseCode);
    formData.append('type', type);
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      await axios.post('https://studyshare-backend-o7jr.onrender.com/api/files/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadMsg({ text: 'Resource uploaded successfully!', isError: false });
      setTitle(''); setDescription(''); setCourseCode(''); setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      setUploadMsg({ text: err.response?.data?.message || 'Upload failed.', isError: true });
    }
  };

  const handleDownload = async (fileId, originalName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        url: `https://studyshare-backend-o7jr.onrender.com/api/files/download/${fileId}`,
        method: 'GET',
        responseType: 'blob', 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      fetchFiles(); // Dynamic incremental counter update
    } catch (err) {
      alert("Unauthorized or corrupt download token.");
    }
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(search.toLowerCase()) || 
                          (f.courseCode && f.courseCode.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filterType === 'All' || f.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-brand-light">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Greeting */}
        <div className="bg-gradient-to-r from-brand-dark to-brand-blue rounded-2xl p-8 text-white shadow-lg mb-8">
          <h1 className="text-3xl font-black">Welcome, {userName}!</h1>
          <p className="text-blue-100 mt-1 text-sm font-medium">Access and collaborate within your verified academic repository.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Side Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md h-fit">
            <h2 className="text-lg font-black text-brand-dark mb-4">Contribute Resources</h2>
            {uploadMsg.text && (
              <div className={`mb-4 p-3 rounded-xl text-xs font-semibold ${uploadMsg.isError ? 'bg-red-50 border border-red-100 text-red-700' : 'bg-emerald-50 border border-emerald-100 text-emerald-700'}`}>
                {uploadMsg.text}
              </div>
            )}
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase">Resource Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Cell Chemistry Lecture Note"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase">Course Code</label>
                <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="e.g. MBC213"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase">Category Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                  <option value="Material">Lecture Material</option>
                  <option value="Past Question">Past Question Paper</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" rows="2" placeholder="Brief outline..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase">Select File</label>
                <input type="file" required onChange={(e) => setSelectedFile(e.target.files[0])} className="mt-1 text-xs block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100" />
              </div>
              <button type="submit" className="w-full bg-brand-blue text-white py-2.5 rounded-xl font-bold hover:bg-brand-accent transition shadow-md text-sm">
                Publish Document
              </button>
            </form>
          </div>

          {/* Directory Repository Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
              <input 
                type="text" 
                placeholder="Search by title, course code..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-2/3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <div className="flex gap-2 w-full sm:w-auto">
                {['All', 'Material', 'Past Question'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterType === t ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {t === 'All' ? 'All Files' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Collection cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file) => (
                  <div key={file._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${file.type === 'Material' ? 'bg-blue-50 text-brand-blue' : 'bg-purple-50 text-purple-700'}`}>
                          {file.type}
                        </span>
                        {file.courseCode && (
                          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                            {file.courseCode}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 leading-tight mb-1">{file.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{file.description || 'No contextual details provided.'}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                      <div className="text-[11px] text-slate-400">
                        <p>By: <span className="font-medium text-slate-600">{file.uploaderName}</span></p>
                        <p>Downloads: <span className="font-bold text-brand-blue">{file.downloads}</span></p>
                      </div>
                      <button 
                        onClick={() => handleDownload(file._id, file.filename)}
                        className="bg-brand-light hover:bg-blue-100 text-brand-blue text-xs font-bold px-3 py-2 rounded-lg transition"
                      >
                        ⬇️ Download
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-slate-400 font-medium bg-white rounded-2xl border border-dashed border-slate-200">
                  No matching workspace academic documents found.
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
