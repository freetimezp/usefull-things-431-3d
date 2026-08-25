import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    /* =========================================================
       LENIS
    ========================================================= */

    const lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    /* =========================================================
   LIQUID SECTION REVEALS
========================================================= */

    const revealCanvases = [
        ...document.querySelectorAll(".section-reveal"),
        document.getElementById("footer-reveal"),
    ].filter(Boolean);

    const reveals = [];

    const revealColors = [
        "#d0e2b0", // section 1
        "#58059b", // section 2
        "#e08a1a", // section 3
        "#050505", // footer
    ];

    revealCanvases.forEach((canvas, index) => {
        const ctx = canvas.getContext("2d");

        const reveal = {
            canvas,
            ctx,

            width: 0,
            height: 0,

            progress: 0,
            target: 0,

            time: Math.random() * 10,

            color: revealColors[index] || "#080808",
        };

        reveals.push(reveal);
    });

    /* =========================================================
   RESIZE
========================================================= */

    function resizeReveal(reveal) {
        const rect = reveal.canvas.getBoundingClientRect();

        reveal.width = rect.width;
        reveal.height = rect.height;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        reveal.canvas.width = reveal.width * dpr;

        reveal.canvas.height = reveal.height * dpr;

        reveal.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    reveals.forEach(resizeReveal);

    /* ---------------------------------------------------------
       GET SECTION BACKGROUND
    --------------------------------------------------------- */

    function getRevealColor(element) {
        const computed = getComputedStyle(element);

        const backgroundColor = computed.backgroundColor;

        /*
         * For the footer we want the dark base color
         * instead of the radial-gradient.
         */

        if (element.tagName === "FOOTER") {
            return "#080808";
        }

        return backgroundColor;
    }

    /* ---------------------------------------------------------
       DRAW LIQUID REVEAL
    --------------------------------------------------------- */
    /* =========================================================
   DRAW
========================================================= */

    function drawReveal(reveal) {
        const { ctx, width, height } = reveal;

        reveal.time += 0.025;

        reveal.progress += (reveal.target - reveal.progress) * 0.08;

        ctx.clearRect(0, 0, width, height);

        /*
         * Colored curtain
         */

        ctx.fillStyle = reveal.color;

        ctx.fillRect(0, 0, width, height);

        /*
         * Opening grows from center
         */

        const opening = width * (0.02 + reveal.progress * 1.2);

        const centerX = width * 0.5;

        const points = 180;

        ctx.save();

        ctx.beginPath();

        /* LEFT EDGE */

        for (let i = 0; i <= points; i++) {
            const t = i / points;

            const y = t * height;

            const wave = Math.sin(t * 12 + reveal.time) * 20;

            const wave2 = Math.sin(t * 28 - reveal.time * 1.4) * 9;

            const edge = opening * 0.5 + wave + wave2;

            const x = centerX - edge;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        /* RIGHT EDGE */

        for (let i = points; i >= 0; i--) {
            const t = i / points;

            const y = t * height;

            const wave = Math.sin(t * 12 + reveal.time) * 20;

            const wave2 = Math.sin(t * 28 - reveal.time * 1.4) * 9;

            const edge = opening * 0.5 + wave + wave2;

            const x = centerX + edge;

            ctx.lineTo(x, y);
        }

        ctx.closePath();

        /*
         * Remove center
         */

        ctx.globalCompositeOperation = "destination-out";

        ctx.fill();

        /*
         * Bright liquid edge
         */

        ctx.globalCompositeOperation = "source-over";

        ctx.strokeStyle = `rgba(
        255,
        255,
        255,
        ${0.2 * (1 - reveal.progress)}
    )`;

        ctx.lineWidth = 1;

        ctx.stroke();

        ctx.restore();
    }

    /* ---------------------------------------------------------
       REVEAL SCROLL TRIGGERS
    --------------------------------------------------------- */
    revealCanvases.forEach((canvas, index) => {
        const reveal = reveals[index];

        const section = canvas.closest(".section, footer");

        if (!section) return;

        ScrollTrigger.create({
            trigger: section,

            start: "top bottom",
            end: "top top",

            scrub: 1,

            onUpdate: (self) => {
                reveal.target = self.progress;
            },
        });
    });

    /* =========================================================
       SECTION REVEALS
    ========================================================= */

    const sections = document.querySelectorAll(".section");

    sections.forEach((section) => {
        const title = section.querySelector("h1");

        const paragraph = section.querySelector("p");

        const index = section.querySelector(".section-index");

        gsap.set(title, {
            y: 80,
            opacity: 0,
        });

        gsap.set(paragraph, {
            y: 30,
            opacity: 0,
        });

        gsap.set(index, {
            y: 20,
            opacity: 0,
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,

                start: "top 70%",
                end: "top 20%",

                toggleActions: "play none none reverse",
            },
        });

        tl.to(index, {
            y: 0,
            opacity: 0.6,

            duration: 0.7,

            ease: "power3.out",
        })
            .to(
                title,
                {
                    y: 0,
                    opacity: 1,

                    duration: 1.2,

                    ease: "power4.out",
                },
                "-=0.4",
            )
            .to(
                paragraph,
                {
                    y: 0,
                    opacity: 0.5,

                    duration: 0.8,

                    ease: "power3.out",
                },
                "-=0.7",
            );

        /* -----------------------------------------------------
           TITLE PARALLAX
        ----------------------------------------------------- */

        gsap.to(title, {
            yPercent: -12,

            ease: "none",

            scrollTrigger: {
                trigger: section,

                start: "top bottom",
                end: "bottom top",

                scrub: true,
            },
        });
    });

    /* =========================================================
       FOOTER
    ========================================================= */

    const footer = document.querySelector("footer");

    const footerContainer = document.querySelector(".footer-container");

    const footerContent = document.querySelector("#footer-content");

    const footerIntro = document.querySelector(".footer-intro");

    const footerLinks = document.querySelector(".footer-links");

    const footerBottom = document.querySelector(".footer-bottom");

    /* ---------------------------------------------------------
       INITIAL FOOTER STATE
    --------------------------------------------------------- */

    gsap.set(footerIntro, {
        y: 100,
        opacity: 0,
    });

    gsap.set(footerLinks, {
        y: 70,
        opacity: 0,
    });

    gsap.set(footerBottom, {
        y: 30,
        opacity: 0,
    });

    /* ---------------------------------------------------------
       FOOTER REVEAL
    --------------------------------------------------------- */

    const footerTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: footer,

            start: "top 90%",
            end: "top 25%",

            scrub: 1,
        },
    });

    footerTimeline
        .to(
            footerContainer,
            {
                y: "0%",

                duration: 1,

                ease: "power3.out",
            },
            0,
        )
        .to(
            footerIntro,
            {
                y: 0,
                opacity: 1,

                duration: 0.8,

                ease: "power3.out",
            },
            0.2,
        )
        .to(
            footerLinks,
            {
                y: 0,
                opacity: 1,

                duration: 0.8,

                ease: "power3.out",
            },
            0.35,
        )
        .to(
            footerBottom,
            {
                y: 0,
                opacity: 1,

                duration: 0.6,

                ease: "power3.out",
            },
            0.55,
        );

    /* ---------------------------------------------------------
       FOOTER SCALE
    --------------------------------------------------------- */

    gsap.fromTo(
        footerContent,
        {
            scale: 0.94,
        },
        {
            scale: 1,

            ease: "none",

            scrollTrigger: {
                trigger: footer,

                start: "top bottom",
                end: "top 20%",

                scrub: true,
            },
        },
    );

    /* =========================================================
       THREE.JS
    ========================================================= */

    const container = document.getElementById("footer-canvas");

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        45,

        container.clientWidth / container.clientHeight,

        0.1,
        100,
    );

    camera.position.set(0, 0, 1.9);

    /* ---------------------------------------------------------
       RENDERER
    --------------------------------------------------------- */

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,

        powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    renderer.setSize(container.clientWidth, container.clientHeight);

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    /* =========================================================
       LIGHTING
    ========================================================= */

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);

    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 5);

    keyLight.position.set(2, 3, 4);

    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xffffff, 12, 5);

    rimLight.position.set(-2, 1, 2);

    scene.add(rimLight);

    /* =========================================================
       DRONE
    ========================================================= */

    const loader = new GLTFLoader();

    let model = null;

    const modelBaseRotationX = 0.45;

    const mouse = {
        x: 0,
        y: 0,
    };

    const targetMouse = {
        x: 0,
        y: 0,
    };

    loader.load(
        "./assets/model/assault_drone_concept.glb",

        (gltf) => {
            model = gltf.scene;

            /* -------------------------------------------------
               CENTER MODEL
            ------------------------------------------------- */

            const box = new THREE.Box3().setFromObject(model);

            const center = box.getCenter(new THREE.Vector3());

            const size = box.getSize(new THREE.Vector3());

            model.position.sub(center);

            /* -------------------------------------------------
               NORMALIZE MODEL
            ------------------------------------------------- */

            const maxDimension = Math.max(size.x, size.y, size.z);

            const isMobile = window.matchMedia("(max-width: 600px)").matches;

            const modelSize = isMobile ? 0.55 : 1.35;

            const scale = modelSize / maxDimension;

            model.scale.setScalar(scale);

            model.position.set(0, 0, 0);

            model.rotation.set(modelBaseRotationX, 0, 0);

            /* -------------------------------------------------
               MATERIALS
            ------------------------------------------------- */

            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;

                    child.receiveShadow = true;
                }
            });

            scene.add(model);

            /* -------------------------------------------------
               ENTRANCE
            ------------------------------------------------- */

            gsap.from(model.scale, {
                x: 0,
                y: 0,
                z: 0,

                duration: 2,

                ease: "elastic.out(1, 0.5)",

                scrollTrigger: {
                    trigger: footer,

                    start: "top 80%",
                },
            });

            gsap.from(model.rotation, {
                z: -0.35,

                duration: 1.8,

                ease: "power4.out",

                scrollTrigger: {
                    trigger: footer,

                    start: "top 80%",
                },
            });
        },

        undefined,

        (error) => {
            console.error("Failed to load drone model:", error);
        },
    );

    /* =========================================================
       MOUSE
    ========================================================= */

    window.addEventListener("mousemove", (event) => {
        targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;

        targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    /* =========================================================
       FOOTER PARALLAX
    ========================================================= */

    ScrollTrigger.create({
        trigger: footer,

        start: "top bottom",
        end: "top 15%",

        scrub: true,

        onUpdate: (self) => {
            const progress = self.progress;

            /*
             * Footer reveal is now controlled
             * by the generic reveal system.
             */

            const footerReveal = reveals.find(
                (item) => item.canvas.id === "footer-reveal",
            );

            if (footerReveal) {
                footerReveal.target = progress;
            }

            if (model) {
                model.position.y = -0.15 + progress * 0.15;

                model.rotation.z = (1 - progress) * -0.15;
            }
        },
    });

    /* =========================================================
       RENDER LOOP
    ========================================================= */

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        /* -----------------------------------------------------
           REVEALS
        ----------------------------------------------------- */

        reveals.forEach((reveal) => {
            drawReveal(reveal);
        });

        /* -----------------------------------------------------
           SMOOTH MOUSE
        ----------------------------------------------------- */

        mouse.x += (targetMouse.x - mouse.x) * 0.035;

        mouse.y += (targetMouse.y - mouse.y) * 0.035;

        if (model) {
            /* -----------------------------------------------
               IDLE ROTATION
            ----------------------------------------------- */

            const idleRotation = Math.sin(elapsed * 0.45) * 0.12;

            /* -----------------------------------------------
               MOUSE ROTATION
            ----------------------------------------------- */

            const targetRotationY = mouse.x * 0.55 + idleRotation;

            const targetRotationX = modelBaseRotationX - mouse.y * 0.3;

            model.rotation.y += (targetRotationY - model.rotation.y) * 0.04;

            model.rotation.x += (targetRotationX - model.rotation.x) * 0.04;

            /* -----------------------------------------------
               FLOATING
            ----------------------------------------------- */

            const floatingY = Math.sin(elapsed * 1.1) * 0.035;

            const floatingZ = Math.cos(elapsed * 0.8) * 0.025;

            model.position.y += (floatingY - model.position.y) * 0.04;

            model.position.z += (floatingZ - model.position.z) * 0.04;

            /* -----------------------------------------------
               MOUSE X MOVEMENT
            ----------------------------------------------- */

            model.position.x += (mouse.x * 0.08 - model.position.x) * 0.02;
        }

        /* -----------------------------------------------------
           CAMERA MOUSE REACTION
        ----------------------------------------------------- */

        camera.position.x += (mouse.x * 0.08 - camera.position.x) * 0.02;

        camera.position.y += (mouse.y * 0.05 - camera.position.y) * 0.02;

        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    animate();

    /* =========================================================
   REVEAL LOOP
========================================================= */

    function revealAnimation() {
        reveals.forEach(drawReveal);

        requestAnimationFrame(revealAnimation);
    }

    revealAnimation();

    /* =========================================================
       RESIZE
    ========================================================= */

    window.addEventListener("resize", () => {
        /* -----------------------------------------------
               REVEAL CANVASES
            ----------------------------------------------- */

        reveals.forEach(resizeReveal);

        /* -----------------------------------------------
               THREE.JS
            ----------------------------------------------- */

        const width = container.clientWidth;

        const height = container.clientHeight;

        camera.aspect = width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        ScrollTrigger.refresh();

        location.reload();
    });

    /* =========================================================
       REFRESH AFTER EVERYTHING LOADS
    ========================================================= */

    window.addEventListener("load", () => {
        reveals.forEach(resizeReveal);

        ScrollTrigger.refresh();
    });
});
