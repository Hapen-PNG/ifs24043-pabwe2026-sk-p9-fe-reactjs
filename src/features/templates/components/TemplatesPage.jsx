import { useEffect, useState } from "react";
import * as templatesApi from "../api/templatesApi.js";
import Loading from "../../../shared/components/Loading.jsx";

export default function TemplatesPage({ token, notify, onNavigate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cloning, setCloning] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await templatesApi.listTemplates();
      setTemplates(data.templates || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function clone(template) {
    setCloning(template.id);
    setError("");
    try {
      await templatesApi.cloneTemplate(token, template.id);
      notify(`Templat “${template.title}” berhasil disalin ke grup Anda.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCloning(null);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">MULAI LEBIH CEPAT</p>
        <h1>Templat komunitas</h1>
        <p className="page-subtitle">Salin alur kerja yang dibagikan dan sesuaikan dengan kebutuhan Anda.</p>
      </div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      {loading ? <Loading label="Memuat templat..." /> : templates.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">◇</span>
          <h2>Belum ada templat publik</h2>
          <p>Grup yang dibagikan oleh anggota akan muncul di sini.</p>
          <button className="button button-quiet" type="button" onClick={() => onNavigate("groups")}>Kelola grup saya</button>
        </div>
      ) : (
        <div className="template-grid">
          {templates.map((template, index) => (
            <article className="template-card" key={template.id}>
              <div className={`template-cover template-cover-${index % 3}`}>
                <span className="template-cover-icon" aria-hidden="true">{["✦", "◈", "◉"][index % 3]}</span>
                <span className="template-count">{template.todos?.length || 0} langkah</span>
              </div>
              <div className="template-card-content">
                <span className="eyebrow">TEMPLAT PUBLIK</span>
                <h2>{template.title}</h2>
                <p>{template.description || "Alur kerja siap digunakan untuk membantu Anda memulai."}</p>
                <ul className="template-preview">
                  {(template.todos || []).slice(0, 3).map((todo) => <li key={todo.id}>{todo.title}</li>)}
                </ul>
                <button className="button button-primary button-wide" type="button" disabled={cloning === template.id} onClick={() => void clone(template)}>
                  {cloning === template.id ? "Menyalin..." : "Salin templat"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
