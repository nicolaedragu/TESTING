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

export default function CPTTest() {
    const navigate = useNavigate();

    const [screen, setScreen] = useState('menu');
    const [currentNumber, setCurrentNumber] = useState(null);
    const [roundCount, setRoundCount] = useState(0);
    const [maxRounds, setMaxRounds] = useState(0);
    const [showStimulus, setShowStimulus] = useState(false);
    const [finalResults, setFinalResults] = useState({ hits: 0, misses: 0, wrongPresses: 0, totalTargets: 0, reactionTimes: [] });

    const [config, setConfig] = useState({
        stimulusDurationMs: 50, 
        blankDurationMs: 750,    
        tutorialRounds: 15,
        testRounds: 60,
        baseProbability: 0.15,
        probabilityIncrement: 0.05,
        withDistractions: false
    });

    const maxRoundsRef = useRef(0);
    const currentNumberRef = useRef(null);
    const roundCountRef = useRef(0);
    const isTargetRef = useRef(false);
    const spacePressedRef = useRef(false);
    const roundsSinceLastTargetRef = useRef(0);
    const resultsRef = useRef({ hits: 0, misses: 0, wrongPresses: 0, totalTargets: 0, reactionTimes: [] });
    const stimulusStartTimeRef = useRef(null);
    
    const timerRef = useRef(null);
    const displayTimerRef = useRef(null);

    const distractionTimerRef = useRef(null);
    const notificationDisplayTimerRef = useRef(null);

    const [notification, setNotification] = useState(null);
    
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

    // Oprim notificările în caz că ieșim de pe pagină
    useEffect(() => {
        return () => clearDistractionTimers();
    }, [clearDistractionTimers]);
    
    const generateSimilarNumber = (prevNum) => {
        if (!prevNum) return Math.floor(1000 + Math.random() * 9000).toString(); 
        const prevArray = prevNum.split('');
        const indexToChange = Math.floor(Math.random() * 4);
        const currentDigit = parseInt(prevArray[indexToChange]);
        let newDigit;
        do {
            newDigit = Math.floor(Math.random() * 10);
            if (indexToChange === 0 && newDigit === 0) newDigit = 1; 
        } while (newDigit === currentDigit); 
        const newArray = [...prevArray];
        newArray[indexToChange] = newDigit.toString();
        return newArray.join('');
    };

    const nextStimulus = useCallback(() => {
        if (roundCountRef.current >= maxRoundsRef.current) {
            finishTest();
            return;
        }
        if (roundCountRef.current > 0 && isTargetRef.current && !spacePressedRef.current) {
            resultsRef.current.misses += 1;
        }
        let nextNum;
        let isTargetThisRound = false;
        if (currentNumberRef.current) {
            const currentProb = config.baseProbability + (roundsSinceLastTargetRef.current * config.probabilityIncrement);
            if (Math.random() < currentProb) {
                nextNum = currentNumberRef.current;
                isTargetThisRound = true;
                roundsSinceLastTargetRef.current = 0; 
                resultsRef.current.totalTargets += 1;
                stimulusStartTimeRef.current = Date.now();
            } else {
                nextNum = generateSimilarNumber(currentNumberRef.current);
                roundsSinceLastTargetRef.current += 1; 
            }
        } else {
            nextNum = generateSimilarNumber(null);
        }
        currentNumberRef.current = nextNum;
        isTargetRef.current = isTargetThisRound;
        spacePressedRef.current = false;
        roundCountRef.current += 1;
        setCurrentNumber(nextNum);
        setRoundCount(roundCountRef.current);
        setShowStimulus(true);
        displayTimerRef.current = setTimeout(() => setShowStimulus(false), config.stimulusDurationMs);
        timerRef.current = setTimeout(nextStimulus, config.stimulusDurationMs + config.blankDurationMs);
    }, [config]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && (screen === 'tutorial' || screen === 'test')) {
                e.preventDefault(); 
                if (spacePressedRef.current) return; 
                spacePressedRef.current = true;
                if (isTargetRef.current) {
                    resultsRef.current.hits += 1;
                    const reactionTime = Date.now() - stimulusStartTimeRef.current;
                    resultsRef.current.reactionTimes.push(reactionTime);
                }
                else {
                    resultsRef.current.wrongPresses += 1;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [screen]);

    const startSequence = (mode) => {
        const targetRounds = mode === 'tutorial' ? config.tutorialRounds : config.testRounds;
        maxRoundsRef.current = targetRounds;
        roundCountRef.current = 0;
        roundsSinceLastTargetRef.current = 0;
        currentNumberRef.current = null;
        resultsRef.current = { hits: 0, misses: 0, wrongPresses: 0, totalTargets: 0, reactionTimes: [] };
        setMaxRounds(targetRounds);
        setRoundCount(0);
        setCurrentNumber(null);
        setScreen(mode);
        clearTimeout(timerRef.current);
        clearTimeout(displayTimerRef.current);
        setTimeout(nextStimulus, 1000);
        
        // Pornim bucla de distrageri dacă e activată opțiunea
        if (config.withDistractions) {
            scheduleNextNotification();
        }
    };

    const saveTestResults = async (resultsData) => {
        // Calculăm acuratețea
        const accuracy = resultsData.totalTargets > 0 
            ? Math.max(0, ((resultsData.hits - resultsData.wrongPresses) / resultsData.totalTargets) * 100) 
            : 0;

        const avgReactionTime = resultsData.reactionTimes && resultsData.reactionTimes.length > 0 
            ? resultsData.reactionTimes.reduce((a, b) => a + b, 0) / resultsData.reactionTimes.length 
            : 500; // o valoare default dacă nu a nimerit nimic
            
        localStorage.setItem('cptAccuracy', accuracy.toFixed(2));
        localStorage.setItem('cptReactionTime', Math.round(avgReactionTime));
            
        try {
            const response = await fetch('http://localhost:5000/cpt/save', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token') 
                },
                body: JSON.stringify({
                    total_targets: resultsData.totalTargets,
                    hits: resultsData.hits,
                    misses: resultsData.misses,
                    wrong_presses: resultsData.wrongPresses,
                    accuracy: accuracy.toFixed(1),
                    with_distractions: config.withDistractions
                })
            });

            if (response.ok) {
                console.log("Rezultate CPT salvate în DB!");
            }
        } catch (error) {
            console.error("Eroare la trimiterea datelor CPT:", error);
        }
    };
    
    const finishTest = () => {
        clearTimeout(timerRef.current);
        clearTimeout(displayTimerRef.current);

        // Oprim notificările
        clearDistractionTimers();
        setNotification(null);        

        if (maxRoundsRef.current === config.testRounds) {
            saveTestResults(resultsRef.current);
        }

        setFinalResults({ ...resultsRef.current });
        setScreen('results');
    };
    
    // Meniu CPT 
    if (screen === 'menu') {
        return (
            <div className="min-h-screen bg-[#ffffff] flex flex-col items-center justify-center p-8 relative">
                <div className="max-w-2xl bg-[#8338ec] p-10 rounded-2xl shadow-2xl border-4 border-[#3a86ff] text-white w-full z-10">
                    <h1 className="text-3xl md:text-4xl font-black mb-6 text-center uppercase tracking-tight">CPT - PERECHI IDENTICE</h1>
                    <p className="mb-6 text-lg font-semibold leading-relaxed">
                        Pe ecran vor apărea rapid numere de 4 cifre.
                    </p>
                    <p className="mb-6 text-lg font-semibold leading-relaxed">
                        Apăsă <strong>SPACE</strong> doar când numărul afișat este <strong>identic</strong> cu cel anterior.
                    </p>
                    <p className="mb-8 font-medium italic opacity-80">
                        Încearcă să apeși <strong>SPACE</strong> cât mai repede. Apasă <strong>F11</strong> pentru a intra în Fullscreen.
                    </p>
                    
                    <div className="bg-white/10 p-6 rounded-xl mb-8 border border-white/20">
                        <label className="block text-sm mb-2 font-black uppercase tracking-wider">
                            Durată afișare: <span className="text-[#3a86ff]">{config.stimulusDurationMs} ms</span>
                        </label>
                        <input 
                            type="range" min="30" max="300" step="10" 
                            value={config.stimulusDurationMs}
                            onChange={(e) => setConfig({...config, stimulusDurationMs: Number(e.target.value)})}
                            className="w-full accent-[#3a86ff]"
                        />
                    </div>
                    {/* Setare Mod Distragere */}
                    <div className="bg-white/10 p-6 rounded-xl mb-8 border border-white/20 flex items-center justify-between">
                        <label className="text-sm font-black uppercase tracking-wider cursor-pointer">
                            Activează Modul cu Notificări
                        </label>
                        <input 
                            type="checkbox" 
                            checked={config.withDistractions}
                            onChange={(e) => setConfig({...config, withDistractions: e.target.checked})}
                            className="w-6 h-6 accent-[#3a86ff] cursor-pointer"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => startSequence('tutorial')} className="bg-[#3a86ff] text-white py-4 rounded-xl font-black text-xl hover:scale-105 transition shadow-lg uppercase">
                            Tutorial
                        </button>
                        <button onClick={() => startSequence('test')} className="bg-[#3a86ff] text-white py-4 rounded-xl font-black text-xl hover:scale-105 transition shadow-lg uppercase border-2 border-white/20">
                            Începe Testul
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-full flex">
                    {colors.map((color, index) => (
                        <div 
                            key={`legend-${index}`}
                            className="flex-1 h-24 sm:h-3"
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                        >
                        </div>
                    ))}
                </div>      
            </div>
        );
    }

    // Rezultate
    if (screen === 'results') {
        const accuracy = finalResults.totalTargets > 0 
            ? Math.max(0, ((finalResults.hits - finalResults.wrongPresses) / finalResults.totalTargets) * 100).toFixed(1) 
            : 0;
        
        return (
            <div className="min-h-screen bg-[#ffffff] flex items-center justify-center relative">
                <div className="bg-[#8338ec] p-10 rounded-2xl shadow-2xl border-4 border-[#3a86ff] text-center max-w-lg w-full text-white z-10">
                    <h2 className="text-3xl font-black mb-8 uppercase">Rezultate</h2>
                    <div className="space-y-3 text-left bg-white/10 p-6 rounded-2xl mb-8 font-bold">
                        <p className="flex justify-between border-b border-white/10 pb-2">Perechi totale: <span>{finalResults.totalTargets}</span></p>
                        <p className="flex justify-between text-green-300">Răspunsuri Corecte: <span>{finalResults.hits}</span></p>
                        <p className="flex justify-between text-yellow-300">Perechi Ratate: <span>{finalResults.misses}</span></p>
                        <p className="flex justify-between text-red-300 font-black">Răspunsuri Greșite: <span>{finalResults.wrongPresses}</span></p>
                        <div className="mt-4 pt-4 text-center text-3xl font-black text-[#3a86ff]">
                            ACURATEȚE: {accuracy}%
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setScreen('menu')} className="w-full bg-[#3a86ff] py-4 rounded-xl font-black uppercase text-xl hover:scale-105 transition shadow-xl">
                        MENIUL TESTULUI
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="w-full bg-[#3a86ff] py-4 rounded-xl font-black uppercase text-xl hover:scale-105 transition shadow-xl">
                        DASHBOARD
                    </button>
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-full flex">
                    {colors.map((color, index) => (
                        <div 
                            key={`legend-${index}`}
                            className="flex-1 h-24 sm:h-3"
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                        >
                        </div>
                    ))}
                </div>              
            </div>
        );
    }

    // ECRANUL TESTULUI
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">            

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

            {/* COMPONENTA DE NOTIFICARE*/}
            {notification && (
                <div className="absolute top-6 left-1/2 bg-[#46488d] border border-[#5c5f9e] shadow-2xl rounded-lg p-3 z-50 w-80 sm:w-96 text-white font-sans animate-slideDownFast" style={{ transform: 'translateX(-50%)' }}>
                    
                    {/* Top bar */}
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2 text-xs opacity-90">
                            <span>{notification.appIcon}</span>
                            <span>{notification.app}</span>
                        </div>
                        <div className="flex gap-3 opacity-70 text-xs">
                            <span className="tracking-widest">•••</span>
                            <span>✕</span>
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
                    <div className="mt-4 bg-[#353770] rounded-md p-2 text-xs text-gray-300 flex justify-between items-center border border-[#46488d] hover:bg-[#3d3f82]">
                        <span>Send a quick reply</span>
                        <span className="transform -rotate-45 opacity-80">➤</span>
                    </div>
                </div>
            )}

            <div className="h-40 flex items-center justify-center z-10">
                {showStimulus && currentNumber ? (
                    <span className="text-white text-9xl font-light tracking-[0.5em] font-mono">
                        {currentNumber}
                    </span>
                ) : (
                    <span className="opacity-0 text-9xl font-mono">0000</span>
                )}
            </div>
        </div>
    );
}