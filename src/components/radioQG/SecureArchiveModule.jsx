// src/components/radioQG/SecureArchiveModule.jsx
import React, { useState } from 'react';
import { Lock, FileText, Upload, Plus, Search, Eye, Download, Shield, X, CheckCircle, AlertTriangle } from '../ui/Icons';

export default function SecureArchiveModule({ archives = [], currentUser, onAddArchive }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('PV');
  const [category, setCategory] = useState('Gouvernance');
  const [contentSummary, setContentSummary] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedArchiveDoc, setSelectedArchiveDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("La taille du fichier archivé ne doit pas dépasser 10 Mo.");
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!file) {
      setErrorMsg("Veuillez téléverser le fichier PDF ou l'image scannée du document officiel.");
      return;
    }

    if (!title.trim()) {
      setErrorMsg("Le titre du document officiel est obligatoire.");
      return;
    }

    setLoading(true);
    try {
      await onAddArchive({
        title,
        type,
        category,
        contentSummary,
        file,
        user: currentUser
      });

      setTitle('');
      setContentSummary('');
      setFile(null);
      setFileName('');
      setShowUploadModal(false);
    } catch (e) {
      setErrorMsg(e.message || "Erreur lors de l'archivage du document.");
    } finally {
      setLoading(false);
    }
  };

  const safeArchives = Array.isArray(archives) ? archives : [];

  const filteredArchives = safeArchives.filter(doc => {
    if (!doc) return false;
    const search = searchTerm.toLowerCase();
    const matchesSearch = doc.title?.toLowerCase().includes(search) ||
                          doc.contentSummary?.toLowerCase().includes(search) ||
                          doc.createdByName?.toLowerCase().includes(search);
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER ARCHIVES SÉCURISÉES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#0B192C]/90 border border-slate-800 rounded-2xl backdrop-blur-md text-white shadow-xl">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-emerald-400 font-serif flex items-center gap-2">
            <Lock className="w-6 h-6" /> Coffre-Fort d'Archivage Sécurisé (PV & Notes)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Archivage confidentiel des Procès-Verbaux, Notes de Service et Comptes Rendus Officiels.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Archiver un Nouveau PV / Note</span>
        </button>
      </div>

      {/* RECHERCHE ET FILTRES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#0B192C]/60 border border-slate-800 rounded-2xl text-white">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un PV, une Note de Service..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
          >
            <option value="all">Tous les Types de Documents</option>
            <option value="PV">Procès-Verbaux (PV)</option>
            <option value="NOTE_SERVICE">Notes de Service</option>
            <option value="COMPTE_RENDU">Comptes Rendus</option>
            <option value="REGLEMENT">Règlements & Directives</option>
          </select>
        </div>
      </div>

      {/* LISTE DES DOCUMENTS ARCHIVÉS */}
      <div className="p-6 bg-[#0B192C]/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-white">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
          Documents Officiels Archivés ({filteredArchives.length})
        </h3>

        {filteredArchives.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-8">Aucun document archivé dans cette catégorie.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArchives.map((docItem) => (
              <div 
                key={docItem.id}
                className="p-4 bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-2xl transition-all space-y-3 font-sans text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 font-mono">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold">
                      {docItem.type}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(docItem.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm mb-1">{docItem.title}</h4>
                  <p className="text-gray-400 text-xs line-clamp-2">{docItem.contentSummary || 'Aucun résumé disponible.'}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 font-mono text-[10px]">
                  <span className="text-gray-500 truncate max-w-[120px]">
                    Par {docItem.createdByName}
                  </span>

                  <button
                    onClick={() => setSelectedArchiveDoc(docItem)}
                    className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ouvrir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE TÉLÉVERSEMENT DOCUMENT ARCHIVÉ */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B192C] border border-emerald-500/40 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-serif">
                  Archivage Document Officiel CDS
                </h3>
                <p className="text-xs text-gray-400">Dépôt sécurisé de Procès-Verbal ou Note de Service.</p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-gray-400 uppercase mb-1">Titre Officiel du Document *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Procès-Verbal du Conseil de Discipline du 28/08/2026"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400 font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Type de Document *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="PV">Procès-Verbal (PV)</option>
                    <option value="NOTE_SERVICE">Note de Service</option>
                    <option value="COMPTE_RENDU">Compte Rendu</option>
                    <option value="REGLEMENT">Règlement & Directive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 uppercase mb-1">Catégorie *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Gouvernance">Gouvernance</option>
                    <option value="Règlement Interne">Règlement Interne</option>
                    <option value="Pédagogie">Pédagogie</option>
                    <option value="Finances & Audit">Finances & Audit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 uppercase mb-1">Résumé Synthétique du Contenu</label>
                <textarea
                  value={contentSummary}
                  onChange={(e) => setContentSummary(e.target.value)}
                  placeholder="Bref résumé des décisions clés consignées dans le document..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400 font-sans text-xs"
                />
              </div>

              {/* UPLOAD FICHIER */}
              <div className="p-4 bg-slate-900/90 border-2 border-dashed border-emerald-500/40 rounded-xl text-center">
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <span className="font-bold text-emerald-300 block uppercase">
                    Téléverser le Document Numérisé *
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Format : PDF, PNG, JPG (Max 10 Mo)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {fileName && (
                  <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Fichier prêt : {fileName}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold uppercase rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                {loading ? "Archivage en cours..." : "Consigner dans le Coffre-Fort"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE LECTURE / TÉLÉCHARGEMENT DOCUMENT */}
      {selectedArchiveDoc && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B192C] border border-emerald-500/40 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative text-white max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedArchiveDoc(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-serif">
                  {selectedArchiveDoc.title}
                </h3>
                <p className="text-xs text-emerald-300 font-mono">
                  {selectedArchiveDoc.type} • {selectedArchiveDoc.fileName}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 mb-4 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Résumé :</span>
                <span className="text-white">{selectedArchiveDoc.contentSummary || 'Aucun résumé.'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Archivé par :</span>
                <span className="text-emerald-400 font-bold">{selectedArchiveDoc.createdByName} le {new Date(selectedArchiveDoc.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* APERÇU DU DOCUMENT */}
            <div className="flex-1 min-h-[300px] bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden p-2">
              {selectedArchiveDoc.fileUrl?.startsWith('data:image/') ? (
                <img 
                  src={selectedArchiveDoc.fileUrl} 
                  alt="Archive" 
                  className="max-h-[400px] object-contain rounded-lg shadow"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <FileText className="w-16 h-16 text-emerald-400 mx-auto animate-pulse" />
                  <p className="text-xs text-gray-300 font-mono">Document officiel sécurisé en format PDF.</p>
                  <a
                    href={selectedArchiveDoc.fileUrl}
                    download={selectedArchiveDoc.fileName || "Document_CDS.pdf"}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all"
                  >
                    <Download className="w-4 h-4" /> Télécharger l'Archive Officielle
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
