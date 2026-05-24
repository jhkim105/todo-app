import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Tag, 
  Database, 
  AlertCircle, 
  Filter, 
  Clock, 
  Edit3,
  X
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: Category | null;
}

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#64748b'  // Slate
];

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  // Backend Switching config
  const [backendUrl, setBackendUrl] = useState<string>('http://localhost:8080');
  const [beError, setBeError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskCategoryId, setTaskCategoryId] = useState<number | null>(null);

  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState(PRESET_COLORS[4]); // violet default

  // Load backend selection from localStorage if exists
  useEffect(() => {
    const savedUrl = localStorage.getItem('todo_backend_url');
    if (savedUrl) {
      setBackendUrl(savedUrl);
    }
  }, []);

  // Fetch Categories & Tasks
  const fetchData = async () => {
    setLoading(true);
    setBeError(null);
    try {
      const catRes = await axios.get<Category[]>(`${backendUrl}/api/categories`);
      setCategories(catRes.data);

      const taskParams = selectedCategoryId ? { categoryId: selectedCategoryId } : {};
      const taskRes = await axios.get<Task[]>(`${backendUrl}/api/tasks`, { params: taskParams });
      setTasks(taskRes.data);
    } catch (err: any) {
      console.error("API Fetch Error:", err);
      setBeError(`백엔드 서버(${backendUrl})와의 연결에 실패했습니다. 서버가 실행 중인지 확인하세요.`);
      setTasks([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [backendUrl, selectedCategoryId]);

  // Handle Backend Switching
  const handleSaveSettings = (newUrl: string) => {
    setBackendUrl(newUrl);
    localStorage.setItem('todo_backend_url', newUrl);
    setIsSettingsModalOpen(false);
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      await axios.post(`${backendUrl}/api/categories`, {
        name: categoryName,
        color: categoryColor
      });
      setCategoryName('');
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('카테고리 생성에 실패했습니다.');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('정말 이 카테고리를 삭제하시겠습니까? 관련 할 일이 영향을 받을 수 있습니다.')) return;

    try {
      await axios.delete(`${backendUrl}/api/categories/${id}`);
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
      fetchData();
    } catch (err) {
      console.error(err);
      alert('카테고리 삭제에 실패했습니다.');
    }
  };

  // Create or Update Task
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const taskPayload = {
      title: taskTitle,
      description: taskDesc.trim() || null,
      completed: editingTask ? editingTask.completed : false,
      dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
      priority: taskPriority,
      categoryId: taskCategoryId
    };

    try {
      if (editingTask) {
        await axios.put(`${backendUrl}/api/tasks/${editingTask.id}`, taskPayload);
      } else {
        await axios.post(`${backendUrl}/api/tasks`, taskPayload);
      }
      resetTaskForm();
      setIsTaskModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('할 일 저장에 실패했습니다.');
    }
  };

  // Toggle Completed status
  const handleToggleComplete = async (task: Task) => {
    const taskPayload = {
      title: task.title,
      description: task.description,
      completed: !task.completed,
      dueDate: task.dueDate,
      priority: task.priority,
      categoryId: task.category?.id || null
    };

    try {
      // Optimistic update in UI
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
      await axios.put(`${backendUrl}/api/tasks/${task.id}`, taskPayload);
      fetchData(); // Sync with DB
    } catch (err) {
      console.error(err);
      alert('상태 업데이트에 실패했습니다.');
      fetchData(); // Rollback on error
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('정말 이 할 일을 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`${backendUrl}/api/tasks/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('할 일 삭제에 실패했습니다.');
    }
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate ? task.dueDate.substring(0, 16) : '');
    setTaskCategoryId(task.category?.id || null);
    setIsTaskModalOpen(true);
  };

  const resetTaskForm = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('MEDIUM');
    setTaskDueDate('');
    setTaskCategoryId(null);
  };

  // Helper: Format ISO date string nicely
  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return null;
    const d = new Date(isoStr);
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Helper: Check if date is overdue
  const isOverdue = (isoStr: string | null, completed: boolean) => {
    if (!isoStr || completed) return false;
    return new Date(isoStr) < new Date();
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div>
          <h1 className="app-title">Interactive Task Manager</h1>
          <p className="app-subtitle">동일한 프론트엔드와 교체 가능한 멀티 백엔드 아키텍처</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="badge" style={{ 
            backgroundColor: backendUrl.includes('8080') 
              ? '#f5f3ff' 
              : backendUrl.includes('5000') 
                ? '#fef3c7' 
                : backendUrl.includes('3333')
                  ? '#ffedd5'
                  : '#ecfdf5',
            color: backendUrl.includes('8080') 
              ? '#6d28d9' 
              : backendUrl.includes('5000') 
                ? '#b45309' 
                : backendUrl.includes('3333')
                  ? '#ea580c'
                  : '#047857',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            textTransform: 'none',
            fontSize: '0.85rem',
            padding: '0.4rem 0.85rem',
            border: backendUrl.includes('8080') 
              ? '1px solid #ddd6fe' 
              : backendUrl.includes('5000')
                ? '1px solid #fde68a'
                : backendUrl.includes('3333')
                  ? '1px solid #fed7aa'
                  : '1px solid #a7f3d0'
          }}>
            <Database size={14} />
            <span>
              {backendUrl.includes('8080') 
                ? 'Spring Boot (Kotlin)' 
                : backendUrl.includes('5000')
                  ? 'Flask (Python)'
                  : backendUrl.includes('3333')
                    ? 'NestJS (TypeScript)'
                    : 'FastAPI (Python)'}
            </span>
          </div>
          
          <button 
            className="btn btn-secondary btn-icon"
            onClick={() => setIsSettingsModalOpen(true)}
            title="백엔드 스위치 설정"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Connection Error Banner */}
      {beError && (
        <div className="glass-panel" style={{ 
          backgroundColor: '#fee2e2', 
          borderColor: '#fecaca', 
          marginBottom: '2rem',
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          color: '#991b1b'
        }}>
          <AlertCircle size={24} style={{ flexShrink: 0, color: '#dc2626' }} />
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.2rem' }}>백엔드 연결 경고</h4>
            <p style={{ fontSize: '0.9rem', color: '#b91c1c' }}>{beError}</p>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ marginLeft: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#dc2626', color: '#ffffff' }}
            onClick={fetchData}
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Main Grid */}
      <main className="main-grid">
        {/* Sidebar */}
        <aside className="sidebar-panel">
          {/* Categories Section */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="section-title">
              <Tag size={18} style={{ color: 'var(--primary)' }} />
              <span>카테고리 필터</span>
              <button 
                className="btn btn-primary btn-icon" 
                style={{ width: '28px', height: '28px', marginLeft: 'auto' }}
                onClick={() => setIsCategoryModalOpen(true)}
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="category-list">
              <div 
                className={`category-item ${selectedCategoryId === null ? 'active' : ''}`}
                onClick={() => setSelectedCategoryId(null)}
              >
                <div className="category-info">
                  <div className="category-dot" style={{ backgroundColor: 'var(--text-muted)' }} />
                  <span className="category-name">전체 할 일</span>
                </div>
                <span className="badge" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-secondary)' }}>
                  {tasks.length}
                </span>
              </div>

              {categories.map(cat => (
                <div 
                  key={cat.id}
                  className={`category-item ${selectedCategoryId === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  <div className="category-info">
                    <div className="category-dot" style={{ backgroundColor: cat.color }} />
                    <span className="category-name">{cat.name}</span>
                  </div>
                  <button 
                    className="btn-danger-text"
                    onClick={(e) => handleDeleteCategory(cat.id, e)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System Info Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontWeight: 600 }}>학습 팁 💡</h4>
            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                백엔드가 <strong>공유 PostgreSQL 데이터베이스</strong>를 사용하기 때문에 백엔드 종류를 전환해도 <u>동일한 할 일 정보</u>가 유지됩니다.
              </li>
              <li>
                OpenAPI 스펙(Swagger UI)을 통해 각각의 프레임워크가 동일한 스펙을 어떻게 처리하는지 확인해보세요.
              </li>
            </ul>
          </div>
        </aside>

        {/* Task List Panel */}
        <section className="glass-panel" style={{ minHeight: '450px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : '전체 목록'}
              </h3>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={() => { resetTaskForm(); setIsTaskModalOpen(true); }}
            >
              <Plus size={18} />
              <span>새 할 일 추가</span>
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>데이터 로딩 중...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <CheckSquareSquare className="empty-icon" size={48} />
              <p style={{ fontWeight: 500 }}>등록된 할 일이 없습니다.</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>우측 상단의 버튼을 눌러 새로운 할 일을 생성해보세요!</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map(task => {
                const overdue = isOverdue(task.dueDate, task.completed);
                return (
                  <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                    <label className="custom-checkbox">
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => handleToggleComplete(task)}
                      />
                      <span className="checkmark"></span>
                    </label>

                    <div className="task-content">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="task-title">{task.title}</span>
                        
                        {/* Priority Badge */}
                        <span className={`badge badge-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>

                        {/* Category Tag */}
                        {task.category && (
                          <span className="badge" style={{ 
                            backgroundColor: `${task.category.color}15`, 
                            color: task.category.color,
                            border: `1px solid ${task.category.color}30`
                          }}>
                            {task.category.name}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="task-desc">{task.description}</p>
                      )}

                      <div className="task-meta">
                        {task.dueDate && (
                          <span className="meta-item" style={{ color: overdue ? 'var(--priority-high)' : 'var(--text-secondary)' }}>
                            <Clock size={12} />
                            <span style={{ fontWeight: overdue ? 700 : 500 }}>
                              {formatDate(task.dueDate)} {overdue ? '(지연됨)' : ''}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button 
                        className="btn-danger-text"
                        onClick={() => openEditTaskModal(task)}
                        title="수정"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        className="btn-danger-text"
                        onClick={() => handleDeleteTask(task.id)}
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Task Modal (Create / Edit) */}
      {isTaskModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingTask ? '할 일 수정하기' : '새로운 할 일 등록'}</h3>
              <button className="modal-close" onClick={() => setIsTaskModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTask}>
              <div className="form-group">
                <label className="form-label">제목 *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="할 일 제목을 입력하세요"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">설명</label>
                <textarea 
                  className="form-input" 
                  placeholder="상세 정보를 입력하세요 (선택)"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">우선순위</label>
                  <select 
                    className="form-input"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                  >
                    <option value="LOW">LOW (낮음)</option>
                    <option value="MEDIUM">MEDIUM (보통)</option>
                    <option value="HIGH">HIGH (높음)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">카테고리</label>
                  <select 
                    className="form-input"
                    value={taskCategoryId || ''}
                    onChange={(e) => setTaskCategoryId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">카테고리 선택 없음</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">만료 일시</label>
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsTaskModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? '수정 완료' : '추가하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Create Modal */}
      {isCategoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">새 카테고리 추가</h3>
              <button className="modal-close" onClick={() => setIsCategoryModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label className="form-label">카테고리 이름 *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: Work, 개인 공부, 운동"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">테마 색상</label>
                <div className="color-picker">
                  {PRESET_COLORS.map(color => (
                    <div 
                      key={color}
                      className={`color-option ${categoryColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCategoryColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  생성하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal (Backend Switcher) */}
      {isSettingsModalOpen && (
        <SettingsModal 
          currentUrl={backendUrl}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}

// Subcomponent: SettingsModal (to avoid clutter)
interface SettingsModalProps {
  currentUrl: string;
  onClose: () => void;
  onSave: (url: string) => void;
}

function SettingsModal({ currentUrl, onClose, onSave }: SettingsModalProps) {
  const [url, setUrl] = useState(currentUrl);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} style={{ color: 'var(--primary)' }} />
            <span>백엔드 커넥션 설정</span>
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">백엔드 서버 API Base URL</label>
          <input 
            type="text" 
            className="form-input" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:8080"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button 
            type="button"
            className="btn btn-secondary" 
            style={{ justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
            onClick={() => setUrl('http://localhost:8080')}
          >
            🟢 Spring Boot Kotlin 백엔드로 설정 (Port 8080)
          </button>
          <button 
            type="button"
            className="btn btn-secondary" 
            style={{ justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
            onClick={() => setUrl('http://localhost:8000')}
          >
            🔵 Python FastAPI 백엔드로 설정 (Port 8000)
          </button>
          <button 
            type="button"
            className="btn btn-secondary" 
            style={{ justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
            onClick={() => setUrl('http://localhost:5000')}
          >
            🟡 Python Flask 백엔드로 설정 (Port 5000)
          </button>
          <button 
            type="button"
            className="btn btn-secondary" 
            style={{ justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
            onClick={() => setUrl('http://localhost:3333')}
          >
            🟠 NestJS TypeScript 백엔드로 설정 (Port 3333)
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => onSave(url)}
          >
            저장 후 연결
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple fallback icon component since lucide-react name is different or just in case
function CheckSquareSquare(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default App;
