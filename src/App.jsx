import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

// Importa dinamicamente todos os arquivos .jsx dentro de presentations
const presentations = import.meta.glob('./presentations/*.jsx', { eager: true });

const Home = () => {
    // Transforma o objeto de imports em uma lista de links
    const list = Object.keys(presentations).map(path => {
        const name = path.split('/').pop().replace('.jsx', '');
        return { name, path: `/${name}` };
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white p-12">
            <h1 className="text-4xl font-bold mb-8">Minhas Apresentações</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {list.map(pres => (
                    <Link
                        key={pres.path}
                        to={pres.path}
                        className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-500 transition-all group"
                    >
                        <h2 className="text-xl font-semibold capitalize group-hover:text-blue-400">{pres.name.replace(/-/g, ' ')}</h2>
                        <p className="text-slate-500 text-sm mt-2">Clique para iniciar a apresentação</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            {Object.entries(presentations).map(([path, module]) => {
                const name = path.split('/').pop().replace('.jsx', '');
                const PresentationComponent = module.default;
                return (
                    <Route
                        key={name}
                        path={`/${name}`}
                        element={<PresentationComponent />}
                    />
                );
            })}
        </Routes>
    );
};

export default App;