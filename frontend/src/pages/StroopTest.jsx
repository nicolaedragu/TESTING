import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const colors = [
    { name: 'GALBEN', hex: '#ffbe0b' },
    { name: 'PORTOCALIU', hex: '#fb5607' },
    { name: 'ROZ', hex: '#ff006e' },
    { name: 'MOV', hex: '#8338ec' },
    { name: 'ALBASTRU', hex: '#3a86ff' },
    { name: 'VERDE', hex: '#7cb518' }
];

// Lista de mesaje aleatoare pentru notificări complete
const distractionMessages = [
    { 
        app: "Microsoft Teams", appIcon: "🗂️", 
        sender: "Andrei-Gabriel SALOMIA (131204)", 
        message: "Ai făcut tema???", 
        iconText: "AS", iconBg: "#fcdbc4", iconColor: "#6b4c2a" 
    },
    { 
        app: "WhatsApp", appIcon: "💬", 
        sender: "Mama", 
        message: "Unde ești? Te sun acum.", 
        iconText: "M❤", iconBg: "#25D366", iconColor: "#ffffff" 
    },
    { 
        app: "Gmail", appIcon: "📧", 
        sender: "Secretariat Facultate", 
        message: "IMPORTANT: Termen limită depunere acte bursă", 
        iconText: "📧", iconBg: "#EA4335", iconColor: "#ffffff" 
    },
    { 
        app: "Instagram", appIcon: "📷", 
        sender: "garnacho_47", 
        message: "Ți-a trimis un reel nou.", 
        iconText: "IG", iconBg: "#C13584", iconColor: "#ffffff" 
    },
    { 
        app: "Telefon", appIcon: "⚙️", 
        sender: "Baterie descărcată", 
        message: "Bateria a ajuns la 15%. Conectează încărcătorul.", 
        iconText: "🔋", iconBg: "#eab308", iconColor: "#ffffff" 
    },
    { 
        app: "LinkedIn", appIcon: "🟦", 
        sender: "Vizualizați invitațiile", 
        message: "Aveți 3 invitații noi. Vedeți cine v-a contactat 🤝", 
        iconText: "🏢", iconBg: "#355ec0", iconColor: "#ffffff" 
    },
    { 
        app: "WizzAir", appIcon: "✈", 
        sender: "Este timpul să faceți check-in!", 
        message: "Zborul dumneavoastră Wizz Air se apropie!", 
        iconText: "⏰", iconBg: "#c4057d", iconColor: "#ffffff" 
    }
];

export default function StroopTest() {
    const navigate = useNavigate();
    
    const [screen, setScreen] = useState('menu');
    
    const [round, setRound] = useState(1);
    const [maxRounds, setMaxRounds] = useState(0);
    const [currentWord, setCurrentWord] = useState({});
    const [currentColor, setCurrentColor] = useState({});
    const [startTime, setStartTime] = useState(null);
    const [results, setResults] = useState([]);
    
    const [feedback, setFeedback] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // Stări și referințe pentru Modul Distragere
    const [config, setConfig] = useState({ withDistractions: false });
    const [notification, setNotification] = useState(null);
    
    const maxRoundsRef = useRef(0);

    const distractionTimerRef = useRef(null);
    const notificationDisplayTimerRef = useRef(null);

    // Funcția care curăță timerele notificărilor, pentru final de test sau când ieșim
    const clearDistractionTimers = useCallback(() => {
        clearTimeout(distractionTimerRef.current);
        clearTimeout(notificationDisplayTimerRef.current);
    }, []);

    // Funcția care alege o pauză și apoi aruncă notificarea
    const scheduleNextNotification = useCallback(() => {
        // între [3 .. 10] secunde
        const delay = Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000;
        
        distractionTimerRef.current = setTimeout(() => {
            // 1. Redăm sunetul
            const audio = new Audio('/notif.mp3');
            audio.play().catch(e => console.log("Sunet blocat de browser", e));

            // 2. Alegem o notificare random
            const randomNotif = distractionMessages[Math.floor(Math.random() * distractionMessages.length)];
            setNotification(randomNotif);

            // 3. O ținem pe ecran 4 secunde
            notificationDisplayTimerRef.current = setTimeout(() => {
                // O ascundem
                setNotification(null); 
                // O pregătim pe următoarea
                scheduleNextNotification(); 
            }, 4000);

        }, delay);
    }, []);

    const generateStimulus = () => {
        const randomWord = colors[Math.floor(Math.random() * colors.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setCurrentWord(randomWord);
        setCurrentColor(randomColor);
        setStartTime(Date.now());
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 250);
    };

    const startTest = (rounds) => {
        setMaxRounds(rounds);
        maxRoundsRef.current = rounds;
        setRound(1);
        setResults([]);
        setScreen('test');
        generateStimulus();
        // Pornim bucla de distrageri dacă e activată opțiunea
        if (config.withDistractions) {
            scheduleNextNotification();
        }
    };

    const saveTestResults = async (finalResults) => {
        const correctAnswers = finalResults.filter(r => r.isCorrect).length;
        const avgTime = finalResults.reduce((acc, curr) => acc + curr.reactionTime, 0) / finalResults.length;
        const accuracy = (correctAnswers / maxRoundsRef.current) * 100;
        
        localStorage.setItem('realAccuracy', accuracy);
        localStorage.setItem('realReactionTime', avgTime);
        
        try {
            const response = await fetch('http://localhost:5000/test/save', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token') 
                },
                body: JSON.stringify({
                    correct_answers: correctAnswers,
                    total_questions: maxRoundsRef.current,
                    avg_reaction_time: Math.round(avgTime),
                    results_json: finalResults,
                    with_distractions: config.withDistractions
                })
            });

            if (response.ok) {
                console.log("Rezultate Stroop salvate în DB!");
            }
        } catch (error) {
            console.error("Eroare la trimiterea datelor Stroop:", error);
        }
    };

    const handleAnswer = (selectedColorHex) => {
        if (feedback) return; 

        const reactionTime = Date.now() - startTime;
        const isCorrect = selectedColorHex === currentColor.hex;

        setFeedback(isCorrect ? 'corect' : 'gresit');

        const newResult = { round, reactionTime, isCorrect };
        const newResultsArray = [...results, newResult];
        setResults(newResultsArray);

        setTimeout(() => {
            setFeedback(null);
            
            if (round < maxRoundsRef.current) {
                setRound(round + 1);
                generateStimulus();
            } else {
                // Oprim notificările
                clearDistractionTimers(); 
                // Ștergem notificarea
                setNotification(null); 

                setScreen('results');
                if (maxRoundsRef.current === 40) {
                    saveTestResults(newResultsArray);
                }
            }
        }, 250);
    };

    // Oprim notificările în caz că ieșim de pe pagină
    useEffect(() => {
        return () => clearDistractionTimers();
    }, [clearDistractionTimers]);

    // MENIU STROOP
    if (screen === 'menu') {
        return (
            <div className="min-h-screen bg-[#ffffff] flex flex-col items-center justify-center p-8 relative">
                <div className="max-w-2xl bg-[#3a86ff] p-10 rounded-2xl shadow-2xl border-4 border-[#8338ec] text-white z-10 w-full">
                    <h1 className="text-3xl md:text-4xl font-black mb-6 text-center uppercase tracking-tight">TESTUL STROOP</h1>
                    <p className="mb-6 text-lg font-semibold leading-relaxed">
                        Pe ecran vor apărea cuvinte colorate.
                    </p>
                    <p className="mb-6 text-lg font-semibold leading-relaxed">
                        Selectează culoarea cu care este <strong>scris</strong> cuvântul apăsând pe caseta corespunzătoare.
                    </p>
                    <p className="mb-8 font-medium italic opacity-80">
                        Tutorialul are 10 runde, testul complet 40.
                    </p>
                        {/* Setare Mod Distragere */}
                        <div className="bg-white/10 p-6 rounded-xl mb-8 border border-white/20 flex items-center justify-between">
                            <label className="text-sm font-black uppercase tracking-wider cursor-pointer">
                                Activează Modul cu Notificări
                            </label>
                            <input 
                                type="checkbox" 
                                checked={config.withDistractions}
                                onChange={(e) => setConfig({...config, withDistractions: e.target.checked})}
                                className="w-6 h-6 accent-[#8338ec] cursor-pointer"
                            />
                        </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                            onClick={() => startTest(10)} 
                            className="bg-[#8338ec] text-white py-4 rounded-xl font-black text-xl hover:scale-105 transition shadow-lg uppercase"
                        >
                            Tutorial
                        </button>
                        <button 
                            onClick={() => startTest(40)} 
                            className="bg-[#8338ec] text-white py-4 rounded-xl font-black text-xl hover:scale-105 transition shadow-lg uppercase border-2 border-white/20"
                        >
                            Începe Testul
                        </button>
                    </div>
                </div>

                <div className="absolute top-0 left-0 w-full flex">
                    {colors.map((color, index) => (
                        <div key={`legend-top-${index}`} className="flex-1 h-3" style={{ backgroundColor: color.hex }}></div>
                    ))}
                </div>
            </div>
        );
    }

    // RESULTS SCREEN
    if (screen === 'results') {
        const correctAnswers = results.filter(r => r.isCorrect).length;
        const avgTime = results.reduce((acc, curr) => acc + curr.reactionTime, 0) / results.length;

        return (
            <div className="min-h-screen bg-[#ffffff] flex items-center justify-center relative">
                <div className="bg-[#3a86ff] p-10 rounded-2xl shadow-2xl border-4 border-[#8338ec] text-center max-w-lg w-full text-white z-10">
                    <h2 className="text-3xl font-black mb-8 uppercase">REZULTATE</h2>
                    <div className="space-y-3 text-left bg-white/10 p-6 rounded-2xl mb-8 font-bold">
                        <p className="flex justify-between border-b border-white/10 pb-2">
                            Răspunsuri Corecte:
                            <span className="text-white">{correctAnswers} / {maxRoundsRef.current}</span>
                        </p>
                        <p className="flex justify-between text-yellow-300">
                            Timp mediu de răspuns:
                            <span>{Math.round(avgTime)} ms</span>
                        </p>
                        <div className="mt-4 pt-4 text-center text-3xl font-black text-[#8338ec]">
                            ACURATEȚE: {Math.round((correctAnswers / maxRoundsRef.current) * 100)}%
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setScreen('menu')} 
                            className="w-full bg-[#8338ec] py-4 rounded-xl font-black uppercase text-xl hover:scale-105 transition shadow-xl"
                        >
                            MENIUL TESTULUI
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard')} 
                            className="w-full bg-[#8338ec] py-4 rounded-xl font-black uppercase text-xl hover:scale-105 transition shadow-xl"
                        >
                            DASHBOARD
                        </button>
                    </div>
                </div>

                <div className="absolute top-0 left-0 w-full flex">
                    {colors.map((color, index) => (
                        <div key={`legend-res-${index}`} className="flex-1 h-3" style={{ backgroundColor: color.hex }}></div>
                    ))}
                </div>
            </div>
        );
    }

    // ECRANUL TESTULUI
    return (
        <div className="min-h-screen flex flex-col bg-white pt-8 relative pb-32 overflow-hidden">
            
            {/* Animatie CSS notificare */}
            <style>
                {`
                    @keyframes slideDownFast {
                        0% { transform: translate(-50%, -100%); opacity: 0; }
                        70% { transform: translate(-50%, 5%); opacity: 1; }
                        100% { transform: translate(-50%, 0); opacity: 1; }
                    }
                    .animate-slideDownFast {
                        animation: slideDownFast 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                    }
                `}
            </style>

            {/* COMPONENTA DE NOTIFICARE */}
            {notification && (
                <div className="absolute top-6 left-1/2 bg-[#46488d] border border-[#5c5f9e] shadow-2xl rounded-lg p-3 z-50 w-80 sm:w-96 text-white font-sans animate-slideDownFast" style={{ transform: 'translateX(-50%)' }}>
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2 text-xs opacity-90">
                            <span>{notification.appIcon}</span>
                            <span>{notification.app}</span>
                        </div>
                        <div className="flex gap-3 opacity-70 text-xs">
                            <span className="cursor-pointer tracking-widest">•••</span>
                            <span className="cursor-pointer">✕</span>
                        </div>
                    </div>

                    {/* Avatar + Mesaj */}
                    <div className="flex items-start gap-3">
                        <div 
                            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                            style={{ backgroundColor: notification.iconBg, color: notification.iconColor }}
                        >
                            {notification.iconText}
                        </div>
                        <div className="flex flex-col leading-tight mt-1">
                            <span className="font-semibold text-sm mb-1">{notification.sender}</span>
                            <span className="text-sm opacity-90">{notification.message}</span>
                        </div>
                    </div>

                    {/* Quick Reply */}
                    <div className="mt-4 bg-[#353770] rounded-md p-2 text-xs text-gray-300 flex justify-between items-center border border-[#46488d] hover:bg-[#3d3f82] cursor-text">
                        <span>Send a quick reply</span>
                        <span className="transform -rotate-45 opacity-80 cursor-pointer">➤</span>
                    </div>
                </div>
            )}
                
            {/* Header cu progres */}
            <div className="w-full max-w-md mx-auto mb-8 px-4">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-500 font-medium">Runda </span>
                    <span className="text-gray-500 font-bold">{round} / {maxRounds}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                        className="bg-gray-600 h-full transition-all duration-300" 
                        style={{ width: `${(round / maxRounds) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center flex-grow px-4">
                
                <div className={`transition-all duration-200 transform ${isAnimating ? 'scale-110 opacity-0' : 'scale-100 opacity-100'} h-40 flex flex-col items-center justify-center relative z-10`}>
                    <div 
                        className="text-7xl sm:text-8xl font-black tracking-tighter uppercase select-none text-center"
                        style={{ color: currentColor.hex }}
                    >
                        {currentWord.name}
                    </div>
                    
                    <div className="h-10 text-center mt-4">
                        {feedback === 'gresit' && <span className="text-red-500 font-bold text-2xl">X</span>}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 w-full max-w-md relative z-10">
                    {colors.map((color, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(color.hex)}
                            className="bg-gray-500 text-white h-24 rounded-xl shadow-sm hover:bg-gray-600 hover:shadow-md transform hover:-translate-y-1 active:scale-95 transition-all duration-200"
                        >
                            <span className="font-bold text-lg tracking-wide">{color.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full flex h-16 shadow-2xl">
                {colors.map((color, index) => (
                    <div key={`bot-${index}`} className="flex-1" style={{ backgroundColor: color.hex }}></div>
                ))}
            </div>
            
            <div className="absolute top-0 left-0 w-full flex z-0">
                {colors.map((color, index) => (
                    <div key={`top-${index}`} className="flex-1 h-3" style={{ backgroundColor: color.hex }}></div>
                ))}
            </div>
        
        </div>
    );
}