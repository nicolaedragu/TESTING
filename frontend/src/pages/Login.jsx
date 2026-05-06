import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Eroare la autentificare');
            }
        } catch (err) {
            setError('Eroare de conexiune la server.');
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 relative">
            <div className="bg-[#3a86ff] p-10 rounded-2xl shadow-2xl border-4 border-[#8338ec] max-w-md w-full text-white z-10">
                <h1 className="text-4xl font-black mb-8 text-center uppercase tracking-tight">Autentificare</h1>
                
                {error && <div className="bg-red-500 text-white font-bold p-3 rounded-lg mb-6 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-black uppercase tracking-wider mb-2">Email</label>
                        <input 
                            type="email" name="email" required
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl text-gray-900 font-bold outline-none ring-2 ring-[#8338ec] focus:ring-4"
                            placeholder="Introdu adresa de email"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black uppercase tracking-wider mb-2">Parolă</label>
                        <input 
                            type="password" name="password" required
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl text-gray-900 font-bold outline-none ring-2 ring-[#8338ec] focus:ring-4"
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="w-full bg-[#8338ec] py-4 rounded-xl font-black uppercase text-xl hover:scale-105 transition shadow-xl mt-4">
                        Intră în cont
                    </button>
                </form>

                <div className="mt-6 text-center font-semibold">
                    <span className="opacity-80">Nu ai un cont? </span>
                    <Link to="/register" className="text-[#ffbe0b] hover:underline font-black">Creează un cont</Link>
                </div>
            </div>
        </div>
    );
}