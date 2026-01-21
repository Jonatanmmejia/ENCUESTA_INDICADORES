import React, { useEffect, useRef } from 'react';

const CursorEffect = () => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e) => {
            mouse.current = { x: e.clientX, y: e.clientY };
            // Mas tranquilo: Solo 1 particula (antes 3)
            if (Math.random() > 0.5) { // Incluso menos frecuencia (50% de las veces)
                particles.current.push(createParticle(e.clientX, e.clientY));
            }
        };

        const createParticle = (x, y) => ({
            x,
            y,
            size: Math.random() * 1.5 + 0.1, // Mas pequeñas
            speedX: (Math.random() - 0.5) * 0.5, // Mucho mas lentas
            speedY: (Math.random() - 0.5) * 0.5,
            life: 1,
            color: `hsla(${Math.random() * 40 + 200}, 70%, 60%, ` // Menos saturacion
        });

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.current.forEach((p, index) => {
                p.life -= 0.01; // Fade mas lento y suave
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.life <= 0) {
                    particles.current.splice(index, 1);
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = p.color + p.life + ')';
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

export default CursorEffect;
