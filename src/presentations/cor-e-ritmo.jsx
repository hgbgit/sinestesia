import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- COMPONENTES DE SINTAXE (Substituem as antigas classes CSS para um código mais limpo) ---
const Tag = ({ children }) => <span className="text-[#FF79C6] font-mono font-bold">{children}</span>;
const Attr = ({ children, pl }) => <span className={`text-[#50FA7B] font-mono ${pl ? 'pl-10' : ''}`}>{children}</span>;
const Str = ({ children }) => <span className="text-[#F1FA8C] font-mono">{children}</span>;
const Punc = ({ children }) => <span className="text-[#8BE9FD] font-mono">{children}</span>;
const Comm = ({ children, className = "" }) => <span className={`text-[#6272A4] font-mono italic ${className}`}>{children}</span>;
const Val = ({ children }) => <span className="text-[#BD93F9] font-mono">{children}</span>;
const Cursor = () => <span className="text-[#50FA7B] font-bold ml-1 animate-[blink_1s_step-end_infinite]">_</span>;

// --- FUNÇÕES DA ANIMAÇÃO MÁQUINA DE ESCREVER ---
const countChars = (node) => {
    if (typeof node === 'string' || typeof node === 'number') return String(node).length;
    if (Array.isArray(node)) return node.reduce((acc, child) => acc + countChars(child), 0);
    if (React.isValidElement(node)) {
        if (node.props.children == null) return 1;
        return countChars(node.props.children);
    }
    return 0;
};

const renderVisible = (node, visibleCount, currentCount = { count: 0 }) => {
    if (currentCount.count >= visibleCount) return null;

    if (typeof node === 'string' || typeof node === 'number') {
        const str = String(node);
        const remaining = visibleCount - currentCount.count;
        if (remaining >= str.length) {
            currentCount.count += str.length;
            return str;
        } else {
            currentCount.count += remaining;
            return str.slice(0, remaining);
        }
    }

    if (Array.isArray(node)) {
        return node.map((child, index) => {
            const rendered = renderVisible(child, visibleCount, currentCount);
            return rendered !== null ? <React.Fragment key={index}>{rendered}</React.Fragment> : null;
        });
    }

    if (React.isValidElement(node)) {
        if (node.props.children == null) {
            currentCount.count += 1;
            return currentCount.count <= visibleCount ? node : null;
        }
        const renderedChildren = renderVisible(node.props.children, visibleCount, currentCount);
        if (renderedChildren === null) return null;
        return React.cloneElement(node, {}, renderedChildren);
    }

    return null;
};

const Stream = ({ d = 0, speed = 4, children }) => {
    const [visibleChars, setVisibleChars] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const textLength = useMemo(() => countChars(children), [children]);

    useEffect(() => {
        let timeout;
        let interval;
        const startTyping = () => {
            interval = setInterval(() => {
                setVisibleChars((prev) => {
                    if (prev + speed >= textLength) {
                        clearInterval(interval);
                        setIsFinished(true);
                        return textLength;
                    }
                    return prev + speed;
                });
            }, 15);
        };

        timeout = setTimeout(startTyping, d);
        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [d, speed, textLength]);

    return (
        <div className="inline-block w-full">
            {renderVisible(children, visibleChars)}
            {!isFinished && <Cursor />}
        </div>
    );
};

// --- EFEITOS DE FUNDO ---
const PaintBlobs = () => (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute rounded-full blur-[80px] opacity-25 animate-[float_12s_infinite_alternate_ease-in-out] w-[500px] h-[500px] bg-[#FF007A] -top-[100px] -left-[100px] delay-0"></div>
        <div className="absolute rounded-full blur-[80px] opacity-25 animate-[float_12s_infinite_alternate_ease-in-out] w-[600px] h-[600px] bg-[#00E5FF] -bottom-[200px] -right-[100px] -delay-[4s]"></div>
        <div className="absolute rounded-full blur-[80px] opacity-25 animate-[float_12s_infinite_alternate_ease-in-out] w-[400px] h-[400px] bg-[#FFD700] top-[30%] left-[40%] -delay-[8s]"></div>
    </div>
);

// --- COMPONENTE PRINCIPAL ---
export default function App() {
    const [hasStarted, setHasStarted] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [scale, setScale] = useState(1);
    const presentationRef = useRef(null);

    const startPresentation = () => {
        setHasStarted(true);
        if (presentationRef.current && !document.fullscreenElement) {
            presentationRef.current.requestFullscreen().catch((err) => console.error(err));
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const scaleX = window.innerWidth / 1350;
            const scaleY = window.innerHeight / 850;
            setScale(Math.min(scaleX, scaleY));
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [hasStarted]);

    useEffect(() => {
        if (!hasStarted) return;
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
            if (e.key === 'ArrowLeft') setCurrentSlide((prev) => Math.max(prev - 1, 0));
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasStarted]);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            presentationRef.current.requestFullscreen().catch((err) => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    const slides = [
        // Slide 1: Intro
        <div className="slide-container" key="slide1">
            <div className="text-left bg-[#181825] p-[50px] rounded-xl border-2 border-dashed border-[#6272A4] w-full">
                <Stream d={300} speed={3}>
                    <h1 className="text-[54px] leading-tight text-[#F5E0DC] font-bold font-mono m-0">
                        <Punc>&lt;</Punc><Tag>ProjetoCultural</Tag><br />
                        <Attr pl>tema</Attr><Punc>=</Punc><Str>"Aprenda a Pintar, Pintando"</Str><br />
                        <Attr pl>formato</Attr><Punc>=</Punc><Val>{"['Arte', 'Educação', 'Tecnologia']"}</Val><br />
                        <Punc>/&gt;</Punc><Cursor />
                    </h1>
                </Stream>
                <Stream d={1500} speed={4}>
                    <p className="mt-8 text-[22px] text-[#6272A4] font-mono italic max-w-[1000px] leading-relaxed">
                        /* Onde o ritmo encontra a cor: Arte, educação, tecnologia, experiência sensorial e interação criativa em um ecossistema cultural multiplataforma. */
                    </p>
                </Stream>
            </div>
        </div>,

        // Slide 2: QUEM SOMOS
        <div className="slide-container" key="slide2">
            <Stream d={100}>
                <h2 className="slide-title mb-6">
                    <Punc>&lt;</Punc><Tag>Equipe</Tag> <Attr>id</Attr><Punc>=</Punc><Str>"quem-somos"</Str> <Punc>/&gt;</Punc><Cursor />
                </h2>
            </Stream>
            <div className="flex flex-col flex-grow justify-center w-full">
                <div className="grid grid-cols-3 gap-8 w-full">
                    {/* Adriana */}
                    <Stream d={400} speed={4}>
                        <div className="flex flex-col items-center bg-[#181825] p-6 rounded-xl border border-[#45475A] shadow-lg h-full">
                            <div className="w-28 h-28 rounded-full border-[4px] border-[#50FA7B] overflow-hidden mb-4 shrink-0">
                                <img src="/public/images/adriana.jpg" alt="Adriana" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-2xl text-[#F5E0DC] font-mono font-bold mb-2">Adriana Gusmão</h3>
                            <p className="text-[15px] text-[#CDD6F4] text-center leading-relaxed flex-grow">
                                Especialista em Neurociência, psicologia positiva e mindfulness. Artista visual, pesquisadora em arte, comportamento e consciência, com atuação em projetos educacionais na área do desenvolvimento humano, além de eventos culturais interdisciplinares, processos criativos e experiências sensoriais.
                            </p>
                            <p className="mt-4 text-[#8BE9FD] text-sm w-full text-center font-mono">
                                <Attr>network.linkedIn</Attr> <Punc>=</Punc> <a href="https://www.linkedin.com/in/adriana-gusm%C3%A3o-41b538b6" target="_blank" rel="noreferrer" className="text-[#F1FA8C] hover:underline">"Perfil"</a><Punc>;</Punc>
                            </p>
                        </div>
                    </Stream>
                    {/* Clara */}
                    <Stream d={800} speed={4}>
                        <div className="flex flex-col items-center bg-[#181825] p-6 rounded-xl border border-[#45475A] shadow-lg h-full">
                            <div className="w-28 h-28 rounded-full border-[4px] border-[#FF79C6] overflow-hidden mb-4 shrink-0">
                                <img src="/public/images/clara.jpg" alt="Clara" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-2xl text-[#F5E0DC] font-mono font-bold mb-2">Clara Afonso</h3>
                            <p className="text-[15px] text-[#CDD6F4] text-center leading-relaxed flex-grow">
                                Artista plástica, educadora e curadora de arte, com trajetória consolidada em pintura, fotografia, design e formação artística, com exposições e reconhecimento institucional no Brasil e no exterior.
                            </p>
                            <p className="mt-4 text-[#8BE9FD] text-sm w-full text-center font-mono">
                                <Attr>network.website</Attr> <Punc>=</Punc> <a href="http://claraafonso.com/pt/" target="_blank" rel="noreferrer" className="text-[#F1FA8C] hover:underline">"Website"</a><Punc>;</Punc>
                            </p>
                        </div>
                    </Stream>
                    {/* Hugo */}
                    <Stream d={1200} speed={4}>
                        <div className="flex flex-col items-center bg-[#181825] p-6 rounded-xl border border-[#45475A] shadow-lg h-full">
                            <div className="w-28 h-28 rounded-full border-[4px] border-[#F1FA8C] overflow-hidden mb-4 shrink-0">
                                <img src="/public/images/hugo.jpg" alt="Hugo" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-2xl text-[#F5E0DC] font-mono font-bold mb-2">Hugo Barros</h3>
                            <p className="text-[15px] text-[#CDD6F4] text-center leading-relaxed flex-grow">
                                Hugo é um Software Engineer com paixão pela inovação tecnológica. Além de sua expertise em desenvolvimento, é um saxofonista dedicado, explorando a fusão entre a lógica da programação e a expressividade da música e da arte.
                            </p>
                            <p className="mt-4 text-[#8BE9FD] text-sm w-full text-center font-mono">
                                <Attr>network.linkedIn</Attr> <Punc>=</Punc> <a href="https://www.linkedin.com/in/hugocamboim/" target="_blank" rel="noreferrer" className="text-[#F1FA8C] hover:underline">"Perfil"</a><Punc>;</Punc>
                            </p>
                        </div>
                    </Stream>
                </div>
            </div>
        </div>,

        // Slide 3: O PROJETO
        <div className="slide-container" key="slide3">
            <Stream d={100}>
                <h2 className="slide-title">
                    <Punc>&lt;</Punc><Tag>Escopo</Tag> <Attr>id</Attr><Punc>=</Punc><Str>"o-projeto"</Str> <Punc>/&gt;</Punc><Cursor />
                </h2>
            </Stream>
            <div className="flex flex-col flex-grow justify-center w-full">
                <Stream d={500}>
                    <p className="text-[26px] text-[#CDD6F4] leading-relaxed mb-10 max-w-[1000px]">
                        <Tag>Aprenda a Pintar, Pintando</Tag> é um projeto cultural que conta com os livros didáticos de colorir e uma plataforma digital, com formação sensorial imersiva. É uma proposta que amplia o ato de pintar e o transforma em uma experiência contemporânea.
                    </p>
                </Stream>
                <Stream d={1200}>
                    <div className="bg-[#181825] p-8 rounded-xl border-l-4 border-[#50FA7B]">
                        <p className="text-xl text-[#8BE9FD] font-mono mb-4"><Tag>const</Tag> <Val>pilares</Val> <Punc>=</Punc> <Punc>[</Punc></p>
                        <ul className="list-none pl-8 space-y-4 text-[22px] text-[#CDD6F4] font-mono">
                            <li><Str>"experimentação cromática"</Str><Punc>,</Punc></li>
                            <li><Str>"prática artística orientada"</Str><Punc>,</Punc></li>
                            <li><Str>"acesso às ferramentas sensoriais digitais"</Str></li>
                        </ul>
                        <p className="text-xl text-[#8BE9FD] font-mono mt-4"><Punc>];</Punc></p>
                    </div>
                </Stream>
            </div>
        </div>,

        // Slide 4: O LIVRO DE COLORIR (Merged com Preview das Imagens)
        <div className="slide-container" key="slide4">
            <Stream d={100}>
                <h2 className="slide-title">
                    <Punc>&lt;</Punc><Tag>Publicacao</Tag> <Attr>tipo</Attr><Punc>=</Punc><Str>"Livro_de_Colorir"</Str> <Punc>/&gt;</Punc><Cursor />
                </h2>
            </Stream>
            <div className="flex flex-col flex-grow justify-center w-full items-center">

                {/* Text Block Merged */}
                <Stream d={400}>
                    <div className="bg-[#181825] p-6 rounded-xl border border-[#45475A] shadow-[0_0_30px_rgba(255,121,198,0.15)] w-full mb-6 text-center">
                        <p className="text-[24px] text-[#50FA7B] font-bold leading-relaxed mb-3">
                            Mais do que um livro de colorir, uma experiência de observação, prática e criação.
                        </p>
                        <p className="text-[18px] text-[#CDD6F4] leading-relaxed px-4">
                            Uma publicação autoral que convida o participante a desenvolver repertório visual, sensibilidade cromática e expressão artística, integrando aprendizagem e prática orientada passo a passo.
                        </p>
                    </div>
                </Stream>

                {/* Images Galery */}
                <div className="grid grid-cols-3 gap-6 w-full items-center">
                    {/* Capa */}
                    <Stream d={1000}>
                        <div className="w-fit h-fit mx-auto flex flex-col justify-center items-center rounded-xl overflow-hidden border-4 border-[#FF79C6] animate-[beat-pulse_3s_infinite_ease-in-out]">
                            <img src="/public/images/capa.jpg" alt="Capa do Livro" className="h-auto w-auto max-h-[300px] max-w-full object-cover block" />
                        </div>
                    </Stream>
                    {/* Cores Primárias */}
                    <Stream d={1500}>
                        <div className="w-fit h-fit mx-auto flex flex-col justify-center items-center rounded-xl overflow-hidden border-4 border-[#8BE9FD] animate-[beat-pulse_3s_infinite_ease-in-out]">
                            <img src="/public/images/cores-primarias.jpg" alt="Cores Primárias" className="h-auto w-auto max-h-[300px] max-w-full object-cover block" />
                        </div>
                    </Stream>
                    {/* Exercício Interação */}
                    <Stream d={2000}>
                        <div className="w-fit h-fit mx-auto flex flex-col justify-center items-center rounded-xl overflow-hidden border-4 border-[#F1FA8C] animate-[beat-pulse_3s_infinite_ease-in-out]">
                            <img src="/public/images/interacao-quente-fria.jpg" alt="Interação Quente e Fria" className="h-auto w-auto max-h-[300px] max-w-full object-cover block" />
                        </div>
                    </Stream>
                </div>

                <Stream d={2500}>
                    <p className="text-[18px] text-[#6272A4] font-mono italic mt-6">
                        // Aprenda no gesto, na repetição e na observação das minúcias.
                    </p>
                </Stream>
            </div>
        </div>,

        // Slide 5: EXPERIÊNCIA EXPANDIDA
        <div className="slide-container" key="slide5">
            <Stream d={100}>
                <h2 className="slide-title">
                    <Punc>&lt;</Punc><Tag>Plataforma</Tag> <Attr>modulo</Attr><Punc>=</Punc><Str>"Experiencia_Expandida"</Str> <Punc>/&gt;</Punc><Cursor />
                </h2>
            </Stream>
            <div className="flex flex-col flex-grow justify-center w-full">
                <Stream d={500}>
                    <p className="text-[26px] text-[#CDD6F4] leading-relaxed mb-10 max-w-[1000px]">
                        O livro se amplia por meio de ferramentas sensoriais acessadas pela plataforma digital, através de código presente no livro.
                    </p>
                </Stream>
                <Stream d={1200}>
                    <div className="bg-[#181825] p-8 rounded-xl border-l-4 border-[#BD93F9]">
                        <p className="text-2xl text-[#F5E0DC] font-mono leading-relaxed m-0">
                            <Tag>Música</Tag>, <Tag>ritmo</Tag>, <Tag>cor</Tag> e <Tag>gesto</Tag> passam a integrar a experiência em uma proposta cultural multiplataforma.
                        </p>
                    </div>
                </Stream>
            </div>
        </div>,

        // Slide 6: SINESTESIA
        <div className="slide-container" key="slide6">
            <Stream d={100}>
                <h2 className="slide-title">
                    <Punc>&lt;</Punc><Tag>App</Tag> <Attr>name</Attr><Punc>=</Punc><Str>"Sinestesia"</Str> <Attr>ai_powered</Attr><Punc>=</Punc><Val>true</Val> <Punc>/&gt;</Punc><Cursor />
                </h2>
            </Stream>
            <div className="flex flex-col flex-grow justify-center w-full">
                <div className="grid grid-cols-2 gap-12 w-full items-center">
                    {/* Bloco de Texto */}
                    <Stream d={500}>
                        <div className="pr-4">
                            <h3 className="text-[36px] text-[#F1FA8C] font-bold mb-4 leading-tight">
                                Uma jornada onde cores se tornam sons, formas ganham ritmo e sua criatividade se transforma em arte viva.
                            </h3>
                            <p className="text-[18px] text-[#CDD6F4] leading-relaxed mb-6">
                                Plataforma conectada onde os leitores podem pintar suas próprias obras com auxílio de <Tag>Inteligência Artificial</Tag>, recebendo suporte técnico para correções e novas ideias de harmonização.
                            </p>

                            {/* Terminal Simulado */}
                            <div className="bg-[#11111B] p-5 rounded-lg border-l-4 border-[#50FA7B] font-mono text-[16px] shadow-[0_0_15px_rgba(80,250,123,0.15)]">
                                <p className="text-[#6272A4] mb-3 italic">// Notificação do sistema enviada ao usuário</p>
                                <p className="text-[#CDD6F4] leading-relaxed">
                                    <span className="text-[#8BE9FD]">Bem-vindo</span>, <Val>usuario@email.com</Val>!<br/><br/>
                                    Você está prestes a embarcar em uma jornada artística única. Aqui, não existem erros — apenas descobertas. Deixe sua criatividade fluir e permita-se explorar.
                                </p>
                            </div>
                        </div>
                    </Stream>

                    {/* Galeria de Prints da Plataforma */}
                    <div className="grid grid-rows-2 gap-6 h-full">
                        <Stream d={1200}>
                            <div className="w-fit h-fit mx-auto flex flex-col justify-center items-center rounded-xl overflow-hidden border-4 border-[#8BE9FD] animate-[beat-pulse_3s_infinite_ease-in-out]">
                                <img src="/public/images/sinestesia-1.jpg" alt="Print da Plataforma Sinestesia 1" className="h-auto w-auto max-h-[220px] max-w-full object-cover block" />
                            </div>
                        </Stream>
                        <Stream d={1800}>
                            <div className="w-fit h-fit mx-auto flex flex-col justify-center items-center rounded-xl overflow-hidden border-4 border-[#FF79C6] animate-[beat-pulse_3s_infinite_ease-in-out]" style={{ animationDelay: '1.5s' }}>
                                <img src="/public/images/sinestesia-2.jpg" alt="Print da Plataforma Sinestesia 2" className="h-auto w-auto max-h-[220px] max-w-full object-cover block" />
                            </div>
                        </Stream>
                    </div>
                </div>
            </div>
        </div>,

        // Slide 7: NR1
        <div className="slide-container" key="slide7">
            <Stream d={100}>
                <h2 className="slide-title">
                    <Punc>&lt;</Punc><Tag>ContextoInstitucional</Tag> <Attr>ref</Attr><Punc>=</Punc><Str>"NR1"</Str> <Punc>/&gt;</Punc><Cursor />
                </h2>
            </Stream>
            <div className="flex flex-col flex-grow justify-center w-full">
                <Stream d={500}>
                    <div className="bg-[#181825] p-10 rounded-xl border-2 border-dashed border-[#8BE9FD]">
                        <p className="text-[24px] text-[#CDD6F4] leading-relaxed m-0">
                            Em um contexto contemporâneo em que a <Val>NR1</Val> amplia a atenção às condições psicossociais e à experiência humana nos ambientes institucionais, o projeto apresenta uma proposta cultural, educativa e lúdica.
                        </p>
                    </div>
                </Stream>
                <Stream d={1500}>
                    <p className="text-[24px] text-[#CDD6F4] leading-relaxed mt-8 px-6">
                        Oferecendo uma experiência artística que pode contribuir para momentos de <Tag>pausa</Tag>, <Tag>fruição</Tag>, <Tag>criatividade</Tag> e reconexão simbólica com a experiência sensível.
                    </p>
                </Stream>
            </div>
        </div>,

        // Slide 8: LEI ROUANET
        <div className="slide-container" key="slide8">
            <Stream d={100}>
                <h2 className="slide-title">
                    <Punc>&lt;</Punc><Tag>Incentivo</Tag> <Attr>lei</Attr><Punc>=</Punc><Str>"Rouanet"</Str> <Punc>/&gt;</Punc><Cursor />
                </h2>
            </Stream>
            <div className="flex flex-col flex-grow justify-center w-full">
                <Stream d={500}>
                    <p className="text-[28px] text-[#CDD6F4] leading-relaxed mb-10 max-w-[900px]">
                        A Lei Rouanet permite ampliar a <Str>qualidade</Str>, a <Str>circulação</Str> e o <Str>alcance</Str> do projeto educacional e artístico.
                    </p>
                </Stream>
                <Stream d={1200}>
                    <div className="bg-[#11111B] p-8 rounded-xl border-l-[6px] border-[#50FA7B]">
                        <p className="text-[22px] text-[#F5E0DC] font-mono leading-relaxed m-0">
                            <Tag>return</Tag> <Punc>{"{"}</Punc><br />
                            <span className="pl-8"><Val>producao</Val>: <Str>"qualificada"</Str>,</span><br />
                            <span className="pl-8"><Val>expansao</Val>: <Str>"digital"</Str>,</span><br />
                            <span className="pl-8"><Val>contrapartidas</Val>: <Str>"sociais"</Str>,</span><br />
                            <span className="pl-8"><Val>entrega</Val>: <Str>"institucional ao patrocinador"</Str></span><br />
                            <Punc>{"}"}</Punc><Punc>;</Punc>
                        </p>
                    </div>
                </Stream>
            </div>
        </div>,

        // Slide 9: VALOR PARA O PATROCINADOR
        <div className="slide-container" key="slide9">
            <Stream d={100}>
                <h2 className="slide-title">
                    <Punc>&lt;</Punc><Tag>Patrocinio</Tag> <Attr>retorno</Attr><Punc>=</Punc><Str>"Valor"</Str> <Punc>/&gt;</Punc><Cursor />
                </h2>
            </Stream>
            <div className="flex flex-col flex-grow justify-center w-full items-center text-center">
                <Stream d={500}>
                    <h3 className="text-[38px] text-[#F1FA8C] font-bold mb-10 m-0 text-center max-w-[800px] mx-auto">
                        Um projeto que associa marca, cultura, educação e inovação.
                    </h3>
                </Stream>
                <Stream d={1500}>
                    <div className="bg-[#181825] py-6 px-12 rounded-full border border-[#FF79C6] shadow-[0_0_20px_rgba(255,121,198,0.2)] mx-auto w-fit">
                        <p className="text-[24px] text-[#CDD6F4] leading-relaxed m-0 text-center">
                            Uma oportunidade de investimento com <Tag>valor simbólico</Tag>, <Tag>reputacional</Tag> e <Tag>impacto cultural</Tag>.
                        </p>
                    </div>
                </Stream>
            </div>
        </div>,

        // Slide 10: ENCERRAMENTO
        <div className="slide-container" key="slide10">
            <Stream d={100}>
                <h2 className="slide-title">
                    <Punc>&lt;</Punc><Tag>Export</Tag> <Attr>default</Attr><Punc>=</Punc><Str>"Encerramento"</Str> <Punc>/&gt;</Punc><Cursor />
                </h2>
            </Stream>
            <div className="flex flex-col flex-grow justify-center w-full items-center">
                <Stream d={500}>
                    <div className="mx-auto text-center w-full self-center bg-[#181825] p-[60px] rounded-xl border-2 border-[#8BE9FD] animate-[beat-pulse_3s_infinite_ease-in-out]">
                        <h2 className="text-[54px] mb-4 text-[#F5E0DC] font-bold font-mono">
                            Aprenda a Pintar, Pintando
                        </h2>
                        <h3 className="text-[28px] mb-8 text-[#50FA7B] font-mono">
                            Projeto cultural: Onde o ritmo encontra a cor
                        </h3>
                        <p className="text-[#CDD6F4] text-[22px] leading-relaxed max-w-[800px] mx-auto">
                            Livro adulto, experiência sensorial e expansão digital reunidos em uma proposta cultural contemporânea e memorável.
                        </p>
                        <div className="mt-10 bg-[#11111B] p-4 rounded-lg inline-block border-l-4 border-[#F1FA8C]">
                            <Tag>console</Tag><Punc>.</Punc><Val>log</Val><Punc>(</Punc><Str>"Fim da Apresentação"</Str><Punc>);</Punc>
                        </div>
                    </div>
                </Stream>
            </div>
        </div>,

        // Slide 11: CONTATO (NOVO SLIDE)
        <div className="slide-container" key="slide11">
            <Stream d={100}>
                <h2 className="slide-title">
                    <Punc>&lt;</Punc><Tag>Contato</Tag> <Attr>action</Attr><Punc>=</Punc><Str>"Fale_Conosco"</Str> <Punc>/&gt;</Punc><Cursor />
                </h2>
            </Stream>
            <div className="flex flex-col flex-grow justify-center w-full items-center">
                <Stream d={500}>
                    <div className="mx-auto text-center w-full max-w-[900px] bg-[#181825] p-[60px] rounded-xl border-2 border-[#50FA7B] shadow-[0_0_30px_rgba(80,250,123,0.15)] animate-[beat-pulse_3s_infinite_ease-in-out]">
                        <h3 className="text-[40px] mb-6 text-[#F5E0DC] font-bold font-mono leading-tight">
                            Tem interesse em saber mais detalhes?
                        </h3>
                        <p className="text-[#CDD6F4] text-[20px] leading-relaxed mb-10 font-mono">
                            <Tag>const</Tag> <Val>mensagem</Val> <Punc>=</Punc> <Str>"Vamos conversar sobre como apoiar ou levar essa experiência para o seu espaço!"</Str><Punc>;</Punc>
                        </p>

                        <a
                            href="https://wa.me/5511985507311"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block bg-transparent border-2 border-[#50FA7B] text-[#50FA7B] py-4 px-8 text-xl font-mono font-bold rounded-lg cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(80,250,123,0.2)] hover:bg-[#50FA7B] hover:text-[#11111B] hover:shadow-[0_0_40px_rgba(80,250,123,0.6)] hover:scale-105 no-underline"
                        >
                            <Punc>&gt;</Punc> Falar com Adriana Gusmão no WhatsApp
                        </a>
                    </div>
                </Stream>
            </div>
        </div>
    ];

    return (
        <div className="bg-gradient-to-br from-[#181825] via-[#1E1E2E] to-[#11111B] bg-[length:200%_200%] animate-[gradient-pulse_8s_ease_infinite] min-h-screen w-screen flex flex-col items-center justify-center font-sans relative overflow-hidden text-[#CDD6F4]" ref={presentationRef}>

            {/* Estilos para animações de keyframes não nativas do Tailwind */}
            <style>{`
                @keyframes gradient-pulse {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes float {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(60px, 80px) scale(1.15); }
                }
                @keyframes blink {
                    50% { opacity: 0; }
                }
                @keyframes beat-pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 25px rgba(255, 121, 198, 0.2); }
                    50% { transform: scale(1.02); box-shadow: 0 0 40px rgba(0, 229, 255, 0.5), 0 0 10px rgba(255, 215, 0, 0.3); }
                }
                /* Classes helper que combinam várias regras nativas */
                .slide-container {
                    background-color: rgba(30, 30, 46, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    box-shadow: 15px 15px 0px rgba(0, 229, 255, 0.4), -15px -15px 0px rgba(255, 215, 0, 0.4);
                    border: 4px solid #FF007A;
                    display: flex;
                    flex-direction: column;
                    height: 720px;
                    justify-content: center;
                    padding: 60px 50px 30px 50px;
                    position: relative;
                    width: 1280px;
                }
                .slide-title {
                    font-size: 36px;
                    font-weight: 500;
                    text-align: left;
                    width: 100%;
                    border-bottom: 1px dashed #45475A;
                    padding-bottom: 10px;
                    color: #F5E0DC;
                    font-family: 'Fira Code', monospace;
                    margin-top: 0;
                }
            `}</style>

            {/* Tela de Inicio para aprovar Fullscreen */}
            {!hasStarted && (
                <div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#181825] via-[#1E1E2E] to-[#11111B] text-white font-mono p-5 text-center">
                    <h1 className="text-[48px] mb-10 text-[#F5E0DC] font-bold">Onde o Ritmo Encontra a Cor</h1>
                    <button
                        className="bg-transparent border-2 border-[#50FA7B] text-[#50FA7B] py-4 px-10 text-2xl font-mono font-bold rounded-lg cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(80,250,123,0.2)] hover:bg-[#50FA7B] hover:text-[#11111B] hover:shadow-[0_0_40px_rgba(80,250,123,0.6)] hover:scale-105"
                        onClick={startPresentation}
                    >
                        Iniciar Apresentação (Fullscreen)
                    </button>
                </div>
            )}

            <PaintBlobs />

            {/* Mostra os slides apenas depois de ter clicado em iniciar */}
            {hasStarted && (
                <div className="transition-transform duration-300 ease-out z-10 origin-center" style={{ transform: `scale(${scale})` }} key={`slide-render-${currentSlide}`}>
                    <div className="absolute top-0 left-0 w-full h-[45px] bg-[#11111B] text-[#89DCEB] flex items-center px-5 font-mono text-base border-b-2 border-[#FF007A] z-10">
                        🔴 🟡 🟢 &nbsp;&nbsp;&nbsp; src/views/ProjetoCultural.jsx
                    </div>
                    {slides[currentSlide]}
                </div>
            )}

            {/* Controles de Navegação Flutuantes - Só mostram quando iniciar */}
            {hasStarted && (
                <div className="absolute bottom-[30px] bg-[#11111B]/90 backdrop-blur-sm border-2 border-[#FF007A] rounded-lg flex gap-5 py-3 px-6 items-center z-[100] shadow-[0_5px_20px_rgba(0,0,0,0.6)] font-mono">
                    <button
                        className="bg-transparent border border-[#6272A4] text-[#8BE9FD] py-2 px-4 rounded-md cursor-pointer font-mono font-bold text-sm transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:not(:disabled):bg-[#44475A] hover:not(:disabled):border-[#50FA7B] hover:not(:disabled):text-[#50FA7B]"
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                    >
                        &lt;- Anterior
                    </button>

                    <span className="text-[#F1FA8C] font-bold text-base min-w-[60px] text-center">
                        {currentSlide + 1} / {slides.length}
                    </span>

                    <button
                        className="bg-transparent border border-[#6272A4] text-[#8BE9FD] py-2 px-4 rounded-md cursor-pointer font-mono font-bold text-sm transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:not(:disabled):bg-[#44475A] hover:not(:disabled):border-[#50FA7B] hover:not(:disabled):text-[#50FA7B]"
                        onClick={nextSlide}
                        disabled={currentSlide === slides.length - 1}
                    >
                        Próximo -&gt;
                    </button>

                    <button
                        className="bg-transparent border border-[#6272A4] text-[#8BE9FD] py-2 px-4 rounded-md cursor-pointer font-mono font-bold text-sm transition-colors duration-200 ml-2.5 hover:bg-[#44475A] hover:border-[#50FA7B] hover:text-[#50FA7B]"
                        onClick={toggleFullscreen}
                    >
                        {isFullscreen ? '[X] Sair Fullscreen' : '[ ] Fullscreen'}
                    </button>
                </div>
            )}
        </div>
    );
}