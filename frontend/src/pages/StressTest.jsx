import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const questions = [
    "1. În ultima lună, cât de des v-ați simțit deranjat(ă) din cauza unui lucru care s-a întâmplat pe neașteptate?",
    "2. În ultima lună, cât de des ați simțit că nu puteți controla lucrurile importante din viața dumneavoastră?",
    "3. În ultima lună, cât de des v-ați simțit nervos/nervoasă și stresat(ă)?",
    "4. În ultima lună, cât de des v-ați simțit încrezător/încrezătoare în capacitatea dumneavoastră de a vă gestiona problemele personale?",
    "5. În ultima lună, cât de des ați simțit că lucrurile mergeau în favoarea dumneavoastră?",
    "6. În ultima lună, cât de des ați constatat că nu puteți face față tuturor lucrurilor pe care trebuia să le faceți?",
    "7. În ultima lună, cât de des ați reușit să controlați problemele din viața dumneavoastră?",
    "8. În ultima lună, cât de des ați simțit că aveți lucrurile sub control?",
    "9. În ultima lună, cât de des v-ați enervat din cauza unor lucruri care erau în afara controlului dumneavoastră?",
    "10. În ultima lună, cât de des ați simțit că dificultățile se acumulau atât de mult încât nu le mai puteați depăși?"
];

const reverseScoredItems = [3, 4, 6, 7];

const options = [
    { value: 0, label: "0 - Niciodată" },
    { value: 1, label: "1 - Aproape niciodată" },
    { value: 2, label: "2 - Uneori" },
    { value: 3, label: "3 - Destul de des" },
    { value: 4, label: "4 - Foarte des" }
];

export default function StressTest() {
    const navigate = useNavigate();
    // Păstrăm răspunsurile într-un array de 10 elemente, inițializat cu null
    const [answers, setAnswers] = useState(Array(10).fill(null));

    const handleSelect = (questionIndex, value) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = value;
        setAnswers(newAnswers);
    };

    const calculateScore = () => {
        // Verificăm dacă a răspuns la toate întrebările
        if (answers.includes(null)) {
            alert("Te rog să răspunzi la toate cele 10 întrebări înainte de a salva!");
            return;
        }

        let totalScore = 0;

        answers.forEach((val, index) => {
            if (reverseScoredItems.includes(index)) {
                // Scorare inversă: 0->4, 1->3, 2->2, 3->1, 4->0
                totalScore += (4 - val);
            } else {
                totalScore += val;
            }
        });

        // Convertim acest scor (0-40) într-o scară de 1-10 pentru a se potrivi cu algoritmul Machine Learning
        let normalizedForML = Math.max(1, Math.round((totalScore / 40) * 10));

        // Salvăm rezultatul real (0-40) și cel pentru ML (1-10)
        localStorage.setItem('pss_score_real', totalScore);
        localStorage.setItem('stress_level_ml', normalizedForML);

        navigate('/profile');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-[#ff006e]">
                    <h1 className="text-3xl font-black text-gray-800 mb-2 uppercase text-center">
                        Stresul perceput - chestionar
                    </h1>
                    <p className="text-gray-500 text-center font-semibold mb-8">
                        Cea mai bună abordare este să răspundeți relativ repede. Alegeți varianta care vi se pare a fi cea mai potrivită estimare.
                    </p>

                    <div className="flex flex-col gap-8">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <p className="font-bold text-lg text-gray-800 mb-4">{q}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                                    {options.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleSelect(qIndex, opt.value)}
                                            className={`p-3 rounded-lg font-bold text-sm transition-all border-2 ${
                                                answers[qIndex] === opt.value
                                                    ? 'bg-[#ff006e] text-white border-[#ff006e] shadow-md scale-105'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#ff006e] hover:text-[#ff006e]'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-700 mb-4">
                        Scorurile individuale pot varia între 0 și 40, iar scorurile mai mari indică un nivel mai ridicat de stres perceput.
                    </p>

                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>Scorurile între 0–13 sunt considerate un nivel scăzut de stres.</li>
                        <li>Scorurile între 14–26 sunt considerate un nivel moderat de stres.</li>
                        <li>Scorurile între 27–40 sunt considerate un nivel ridicat de stres perceput.</li>
                    </ul>
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