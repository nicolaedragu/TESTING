import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', 'user'); // Utilizatorii noi sunt automat user, nu admin
                navigate('/profile');
            } else {
                setError(data.message || 'Eroare la înregistrare');
            }
        } catch (err) {
            setError('Eroare de conexiune la server.');
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 relative">
            <div className="bg-[#8338ec] p-10 rounded-2xl shadow-2xl border-4 border-[#3a86ff] max-w-md w-full text-white z-10">
                <h1 className="text-4xl font-black mb-8 text-center uppercase tracking-tight">Înregistrare</h1>
                
                {error && <div className="bg-red-500 text-white font-bold p-3 rounded-lg mb-6 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-black uppercase tracking-wider mb-2">Nume Complet</label>
                        <input 
                            type="text" name="name" required
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl text-gray-900 font-bold outline-none ring-2 ring-[#3a86ff] focus:ring-4"
                            placeholder="Ex: Ion Alexandru"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black uppercase tracking-wider mb-2">Email</label>
                        <input 
                            type="email" name="email" required
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl text-gray-900 font-bold outline-none ring-2 ring-[#3a86ff] focus:ring-4"
                            placeholder="ionalexandru@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black uppercase tracking-wider mb-2">Parolă</label>
                        <input 
                            type="password" name="password" required
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl text-gray-900 font-bold outline-none ring-2 ring-[#3a86ff] focus:ring-4"
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="w-full bg-[#3a86ff] py-4 rounded-xl font-black uppercase text-xl hover:scale-105 transition shadow-xl mt-4">
                        Creează Contul
                    </button>
                </form>

                <div className="mt-6 text-center font-semibold">
                    <span className="opacity-80">Ai deja cont? </span>
                    <Link to="/login" className="text-[#ffbe0b] hover:underline font-black">Autentificare</Link>
                </div>
            </div>
        </div>
    );
}