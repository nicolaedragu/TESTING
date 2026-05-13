import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const questions = [
    "1. Lipsesc de la munca planificată din cauza folosirii telefonului.",
    "2. Îmi este greu să mă concentrez la muncă, la cursuri sau când fac teme din cauza folosirii telefonului.",
    "3. Simt durere la încheieturi sau în spatele gâtului în timp ce folosesc telefonul.",
    "4. Nu suport să nu am telefonul la mine.",
    "5. Mă simt iritat și nerăbdător când nu am telefonul în mână.",
    "6. Mă gândesc la telefonul meu chiar și atunci când nu îl folosesc.",
    "7. Nu aș renunța niciodată la telefon, chiar dacă viața mea zilnică este deja foarte afectată de acesta.",
    "8. Îmi verific constant telefonul pentru a nu pierde conversațiile cu alții pe rețelele sociale.",
    "9. Folosesc telefonul mai mult timp decât intenționasem inițial.",
    "10. Oamenii din jurul meu îmi spun că sunt dependent de telefonul meu."
];

const options = [
    { value: 1, label: "1 - Total în dezacord" },
    { value: 2, label: "2 - Dezacord" },
    { value: 3, label: "3 - Dezacord slab" },
    { value: 4, label: "4 - Acord slab" },
    { value: 5, label: "5 - Acord" },
    { value: 6, label: "6 - Total de acord" }
];

export default function AddictionTest() {
    const navigate = useNavigate();
    const [answers, setAnswers] = useState(Array(10).fill(null));

    const handleSelect = (questionIndex, value) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = value;
        setAnswers(newAnswers);
    };

    const calculateScore = () => {
        if (answers.includes(null)) {
            alert("Te rog să răspunzi la toate cele 10 întrebări înainte de a salva!");
            return;
        }

        // Calculăm suma directă a răspunsurilor (scor între 10 și 60)
        const totalScore = answers.reduce((acc, curr) => acc + curr, 0);

        let normalized = Math.max(1, Math.round((totalScore / 60) * 10));
        
        // Salvăm scorul în localStorage exclusiv pentru cercetare
        localStorage.setItem('sas_score', normalized);

        navigate('/profile');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-[#3a86ff]">
                    <h1 className="text-3xl font-black text-gray-800 mb-2 uppercase text-center">
                        Dependența de telefon - chestionar
                    </h1>
                    <p className="text-gray-500 text-center font-semibold mb-8">
                        Răspunde sincer la următoarele afirmații pentru a evalua nivelul tău de dependență de telefon. Acest scor este utilizat strict în scop de cercetare.
                    </p>

                    <div className="flex flex-col gap-8">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <p className="font-bold text-lg text-gray-800 mb-4">{q}</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {options.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleSelect(qIndex, opt.value)}
                                            className={`p-3 rounded-lg font-bold text-xs transition-all border-2 ${
                                                answers[qIndex] === opt.value
                                                    ? 'bg-[#3a86ff] text-white border-[#3a86ff] shadow-md scale-105'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#3a86ff] hover:text-[#3a86ff]'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={calculateScore}
                        className="mt-10 w-full bg-gray-800 text-white py-4 rounded-xl text-xl font-black hover:scale-[1.02] transition-transform uppercase shadow-lg"
                    >
                        Salvează Răspunsurile
                    </button>
                </div>
            </div>
        </div>
    );
}