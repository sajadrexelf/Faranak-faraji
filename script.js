/**
 * ============================================================================
 * پلتفرم هوشمند تمرین و تناسب اندام فرانک فرجی (لوتوس جیم)
 * بخش پنجم: یکپارچه‌سازی نهایی، اسلایدر بی‌نهایت برنامه‌ها، همگام‌سازی ویدیوها و تست‌های پذیرش
 * بر مبنای معماری اسکرول پیوسته و اسلایدر ۳۰تایی سند مرجع Jaipur City
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     ۱. تنظیمات و شناسه‌های مرکزی پروژه (Configuration & Constants)
     ========================================================================== */
  const CONFIG = {
    // مسیر مورد انتظار برای مدل سه‌بعدی ریگ‌شده آواتار
    AVATAR_MODEL_URL: '/assets/models/faranak_avatar_rigged.glb',

    // بازه‌های پیشرفت فازهای روایی بر حسب پیکسل اسکرول
    SCENE_THRESHOLDS: {
      HERO: { start: 0, exitStart: 250, exitEnd: 750 },
      CHEST: { enterStart: 700, enterEnd: 1100, exitStart: 1650, exitEnd: 2000 },
      BACK: { enterStart: 1950, enterEnd: 2350, exitStart: 2850, exitEnd: 3200 },
      CORE: { enterStart: 3100, enterEnd: 3500, exitStart: 3950, exitEnd: 4250 },
      SIGHTS: { enterStart: 4150, enterEnd: 4450, exitStart: 5100, exitEnd: 5400 }
    },

    // نقاط کلیدی موقعیت و جهت نگاه دوربین برای هر مرحله
    CAMERA_KEYFRAMES: {
      hero: {
        pos: { x: 0, y: 0.35, z: 3.8 },
        lookAt: { x: 0, y: 0.2, z: 0 },
        avatarRotY: 0
      },
      chest: {
        pos: { x: -0.75, y: 0.48, z: 2.85 },
        lookAt: { x: -0.35, y: 0.38, z: 0 },
        avatarRotY: -0.12
      },
      back: {
        pos: { x: -0.75, y: 0.45, z: -2.65 },
        lookAt: { x: -0.35, y: 0.38, z: 0 },
        avatarRotY: Math.PI * 0.82
      },
      core: {
        pos: { x: -0.75, y: 0.12, z: 2.35 },
        lookAt: { x: -0.35, y: 0.15, z: 0 },
        avatarRotY: 0.16
      },
      sights: {
        pos: { x: 0, y: 0.55, z: 4.6 },
        lookAt: { x: 0, y: 0.25, z: 0 },
        avatarRotY: 0
      }
    },

    // قرارداد نگاشت کلیپ‌های انیمیشن
    ANIMATION_CLIPS: {
      IDLE: 'Avatar_Coach_Idle',
      CHEST_PRESS: 'Exercise_Chest_Press_Scrub',
      DUMBBELL_ROW: 'Exercise_Dumbbell_Row_Scrub',
      CORE_CRUNCH: 'Exercise_Core_Crunch_Scrub'
    },

    // پالت رنگ‌های نوری عضلات هدف
    COLORS: {
      CYAN_EMISSIVE: 0x38bdf8,
      GOLD_EMISSIVE: 0xf59e0b,
      AMBER_DEEP: 0xd97706,
      SUIT_BLACK: 0x111615
    }
  };

  // داده‌های تفصیلی دوره‌ها و برنامه‌های تمرینی برای نمایش در مودال تعاملی
  const PROGRAMS_DATA = {
    'weight-loss': {
      title: 'برنامه جامع کاهش وزن و چربی‌سوزی',
      kicker: 'برنامه اختصاصی متابولیک',
      desc: 'پروتکل علمی کاهش درصد چربی بدن همگام با حفظ حداکثری بافت عضلانی از طریق تمرینات تناوبی با شدت بالا (HIIT)، مدارهای مقاومتی و زمان‌بندی دقیق ریکاوری.',
      sessions: '۴ جلسه در هفته (۵۰ دقیقه)',
      level: 'کلیه سطوح (مبتدی تا پیشرفته)',
      focus: 'افزایش نرخ متابولیک، کل بدن و زنجیره قدامی-خلفی'
    },
    'hypertrophy': {
      title: 'عضله‌سازی و افزایش حجم تخصصی',
      kicker: 'هایپرتروفی علمی',
      desc: 'طراحی ویژه بارگذاری پیشرونده با تمرکز بر اضافه بار تنش مکانیکی و استرس متابولیک برای ساخت حجم عضلانی متقارن، افزایش تراکم استخوان و شکل‌دهی سینمایی عضلات.',
      sessions: '۴ الی ۵ جلسه در هفته (۶۰ دقیقه)',
      level: 'متوسط تا پیشرفته',
      focus: 'سینه، زیر بغل، سرشانه و پاها'
    },
    'women-fitness': {
      title: 'تمرینات تخصصی بانوان و فرم‌دهی اندام',
      kicker: 'تناسب و فرم‌دهی لوتوس',
      desc: 'تمرینات ساختارمند با هدایت مستقیم فرانک فرجی جهت فرم‌دهی عضلات سرینی (Glutes)، سفت‌سازی بالاتنه، باریک‌سازی دور کمر و تقویت کف لگن بدون حجیم‌سازی ناخواسته.',
      sessions: '۳ الی ۴ جلسه در هفته (۴۵ دقیقه)',
      level: 'تمامی سطوح',
      focus: 'سرینی، همسترینگ، عضلات میانی و پاسچر'
    },
    'strength-hypertrophy': {
      title: 'عضله‌سازی و فرم‌دهی تخصصی',
      kicker: 'دوره جامع هایپرتروفی',
      desc: 'برنامه تمرینی علمی ۴ الی ۵ روزه با تمرکز بر بارگذاری پیشرونده، هایپرتروفی هدفمند و تفکیک عضلات ماژور و مینور همراه با آموزش سه‌بعدی زوایای مفاصل و مسیر فیبرهای عضلانی.',
      sessions: '۴ الی ۵ جلسه در هفته (۶۰ دقیقه)',
      level: 'متوسط تا پیشرفته',
      focus: 'پکتورالیس، لت‌ها، دلتوئید و زنجیره خلفی'
    },
    'core-stability': {
      title: 'تقویت میان‌تنه و ثبات ایزومتریک',
      kicker: 'تخصصی عضلات مرکزی و پاسچر',
      desc: 'تقویت عضلات عمقی شکم (ترانسورس ابدومینیس)، ارکتور اسپاین و عضلات مایل جهت پایداری ستون فقرات، کاهش گودی کمر و ارتقای انتقال نیرو بین بالاتنه و پایین‌تنه.',
      sessions: '۳ جلسه در هفته (۴۵ دقیقه)',
      level: 'کلیه سطوح (مبتدی تا حرفه‌ای)',
      focus: 'راست شکمی، عضلات مایل و کمربند لگنی'
    },
    'nutrition-metabolism': {
      title: 'تغذیه ورزشی و متابولیسم لوتوس',
      kicker: 'رژیم علمی و پایدار',
      desc: 'پروتکل جامع تغذیه‌ای منطبق بر اهداف هایپرتروفی، چربی‌سوزی یا تثبیت با ارزیابی دقیق درشت‌مغذی‌ها، پروتئین دریافتی، زمان‌بندی مکمل‌ها و عادات زیستی پایدار.',
      sessions: 'پایش هفتگی و تطبیق دوره‌ای',
      level: 'اختصاصی با تیپ بدنی',
      focus: 'بهینه‌سازی متابولیسم و ریکاوری بافت‌ها'
    },
    'yoga-mobility': {
      title: 'یوگا، موبیلیتی و ریکاوری سیستم عصبی',
      kicker: 'موبیلیتی و آرامش',
      desc: 'حرکات کنترل‌شده آزادسازی میوفاشیال، بهبود انعطاف‌پذیری کپسول مفصلی و کاهش دردهای عضلانی ناشی از تمرینات سنگین مقاومتی و بازگرداندن تعادل سمپاتیک.',
      sessions: '۲ الی ۳ جلسه در هفته (۴۰ دقیقه)',
      level: 'مقدماتی تا پیشرفته',
      focus: 'دامنه حرکتی مفاصل و انعطاف‌پذیری فاسیا'
    },
    'pilates-control': {
      title: 'پیلاتس و کنترل عصبی-عضلانی',
      kicker: 'ثبات مرکزی بدن',
      desc: 'تمرینات تخصصی کنترل وضعیت بدن، اصلاح پاسچر، فعال‌سازی فیبرهای نوع ۱ و ایجاد هارمونی کامل بین تنفس دیافراگمی و انقباضات ایزومتریک.',
      sessions: '۳ جلسه در هفته (۵۰ دقیقه)',
      level: 'مقدماتی تا متوسط',
      focus: 'عضلات کف لگن، دیواره شکمی و پاسچر'
    }
  };

  /* ==========================================================================
     ۲. مدیریت وضعیت برنامه (State Management)
     ========================================================================== */
  const state = {
    // مختصات ماوس و پارالاکس
    targetMouseX: 0,
    targetMouseY: 0,
    mouseX: 0,
    mouseY: 0,

    // متغیرهای اسکرول و روایت
    scrollDistance: 0,
    scrollProgress: 0,
    scrollDirection: 1,
    lastScrollDistance: 0,

    // فاز فعال جاری
    currentStage: 'hero', // 'hero' | 'chest-shoulders' | 'back-lats' | 'core' | 'sights'

    // وضعیت اسلایدر بی‌نهایت Jaipur City
    slider: {
      activeIndex: 5, // شروع در دسته میانی
      originalCount: 5,
      totalCount: 15,
      isJumping: false,
      cardWidth: 320,
      gap: 24,
      touchStartX: 0,
      touchCurrentX: 0,
      isDragging: false
    },

    // وضعیت صحنه سه‌بعدی و بارگذاری دارایی‌ها
    threeReady: false,
    modelLoading: false,
    modelLoaded: false,
    modelLoadError: false,
    isProceduralActive: true, // در غیاب فایل GLB، آواتار آناتومیک رویه‌ای فعال است

    // تنظیمات دسترسی‌پذیری و عملکرد
    reduceMotion: false,
    isSoftwareGl: false
  };

  // مپ المان‌های DOM
  const dom = {
    cinema: null,
    root: null,
    canvas: null,
    sceneLoading: null,
    progressBar: null,
    sceneNumber: null,
    sceneName: null,
    muscleLabel: null,
    heroCopy: null,
    panelChest: null,
    panelBack: null,
    panelCore: null,
    sightsSlider: null,
    sightsTrack: null,
    sightsControls: null,
    btnPrev: null,
    btnNext: null,
    programModal: null,
    modalCloseBtn: null,
    modalTitle: null,
    modalKicker: null,
    modalDesc: null,
    modalSessions: null,
    modalLevel: null,
    modalFocus: null,
    videoChest: null,
    videoBack: null,
    videoCore: null
  };

  // اشیاء اصلی Three.js
  let scene, camera, renderer, mixer;
  let avatarGroup, chestGroup, deltoidGroup, backGroup, coreGroup;
  let dumbbellLeft, dumbbellRight;
  let glowMaterialChest, glowMaterialBack, glowMaterialCore;

  /* ==========================================================================
     ۳. توابع ریاضی اینترپولیشن (Math & Interpolation Helpers)
     ========================================================================== */
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (e0, e1, v) => {
    const x = clamp((v - e0) / (e1 - e0));
    return x * x * (3 - 2 * x);
  };

  /* ==========================================================================
     ۴. تشخیص رندر نرم‌افزاری و محافظت عملکرد (Software WebGL Guard)
     ========================================================================== */
  function detectSoftwareGl() {
    try {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2') || probe.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param)).toLowerCase();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return gpu.includes('swiftshader') || gpu.includes('llvmpipe') || gpu.includes('software');
    } catch (e) {
      return true;
    }
  }

  /* ==========================================================================
     ۵. راه‌اندازی صحنه سه‌بعدی Three.js (Scene, Camera, Renderer, Lights)
     ========================================================================== */
  function initThreeScene() {
    if (typeof THREE === 'undefined') {
      console.warn('[Lotus Gym 3D] کتابخانه Three.js لود نشده است.');
      return false;
    }

    dom.canvas = document.getElementById('fitness-canvas');
    if (!dom.canvas) return false;

    state.isSoftwareGl = detectSoftwareGl();
    const width = window.innerWidth;
    const height = window.innerHeight;

    // ۱. ایجاد صحنه
    scene = new THREE.Scene();

    // ۲. ایجاد دوربین پرسپکتیو
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(
      CONFIG.CAMERA_KEYFRAMES.hero.pos.x,
      CONFIG.CAMERA_KEYFRAMES.hero.pos.y,
      CONFIG.CAMERA_KEYFRAMES.hero.pos.z
    );
    camera.lookAt(
      CONFIG.CAMERA_KEYFRAMES.hero.lookAt.x,
      CONFIG.CAMERA_KEYFRAMES.hero.lookAt.y,
      CONFIG.CAMERA_KEYFRAMES.hero.lookAt.z
    );

    // ۳. رندرر WebGL با تنظیمات تطبیقی
    renderer = new THREE.WebGLRenderer({
      canvas: dom.canvas,
      antialias: !state.isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(state.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // ۴. نورپردازی سینمایی استودیو
    setupLighting();

    // ۵. تلاش برای بارگذاری مدل GLB یا فعال‌سازی مدل رویه‌ای جایگزین
    loadAvatarModelPipeline();

    state.threeReady = true;

    // ثبت شنونده‌های مربوط به مدیریت حافظه WebGL
    dom.canvas.addEventListener('webglcontextlost', handleContextLost, false);
    dom.canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    console.log('[Lotus Gym 3D Engine] موتور سه‌بعدی Three.js راه‌اندازی شد. رندر نرم‌افزاری:', state.isSoftwareGl);
    return true;
  }

  /**
   * پیکربندی نورپردازی سینمایی باشگاه
   */
  function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x0e1716, 2.6);
    scene.add(ambientLight);

    // نور اصلی کلیدی (Warm Key Light)
    const keyLight = new THREE.DirectionalLight(0xfff1e0, 2.9);
    keyLight.position.set(3.2, 4.2, 3.2);
    scene.add(keyLight);

    // نور حاشیه‌ای آبی الکتریکی برای برجسته‌سازی فیبرهای عضلانی (Cyan Rim Light)
    const cyanRim = new THREE.DirectionalLight(CONFIG.COLORS.CYAN_EMISSIVE, 3.6);
    cyanRim.position.set(-3.5, 2.2, -2.5);
    scene.add(cyanRim);

    // نور تأکیدی طلایی لوتوس (Gold Accent Light)
    const goldAccent = new THREE.PointLight(CONFIG.COLORS.GOLD_EMISSIVE, 2.2, 10);
    goldAccent.position.set(0, 1.2, 1.6);
    scene.add(goldAccent);
  }

  /* ==========================================================================
     ۶. خط لوله بارگذاری مدل آواتار و دارایی‌های سه‌بعدی (Avatar Loader Pipeline)
     ========================================================================== */
  function loadAvatarModelPipeline() {
    state.modelLoading = true;
    updateLoadingHUD('در حال بررسی فایل مدل سه‌بعدی آواتار...');

    if (typeof THREE.GLTFLoader !== 'function') {
      console.warn('[Lotus Gym 3D] GLTFLoader در دسترس نیست؛ فعال‌سازی مدل آناتومیک رویه‌ای.');
      fallbackToProceduralAvatar('GLTFLoader_Not_Found');
      return;
    }

    const loader = new THREE.GLTFLoader();

    loader.load(
      CONFIG.AVATAR_MODEL_URL,
      function (gltf) {
        state.modelLoading = false;
        state.modelLoaded = true;
        state.isProceduralActive = false;
        hideLoadingHUD();

        const model = gltf.scene;
        model.scale.set(1.4, 1.4, 1.4);
        model.position.set(0, -0.9, 0);

        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
          });
        }

        avatarGroup = new THREE.Group();
        avatarGroup.add(model);
        scene.add(avatarGroup);
        console.log('[Lotus Gym 3D] مدل ریگ‌شده آواتار با موفقیت بارگذاری شد.');
      },
      function (xhr) {
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          updateLoadingHUD(`در حال بارگذاری مدل: ${percent}%`);
        }
      },
      function (error) {
        state.modelLoading = false;
        state.modelLoadError = true;
        console.info('[Lotus Gym 3D] فایل مدل GLB خارجی یافت نشد. فعال‌سازی مدل آواتار آناتومیک رویه‌ای (Procedural Rig).');
        fallbackToProceduralAvatar('Asset_Not_Found_Using_Procedural');
      }
    );
  }

  /**
   * فعال‌سازی آواتار آناتومیک رویه‌ای کامل در غیاب فایل خارجی GLB
   */
  function fallbackToProceduralAvatar(reason) {
    state.isProceduralActive = true;
    hideLoadingHUD();

    avatarGroup = new THREE.Group();

    // ۱. متریال‌های پایه لباس و هایلایت عضلات
    glowMaterialChest = new THREE.MeshStandardMaterial({
      color: 0x0f2938,
      emissive: CONFIG.COLORS.CYAN_EMISSIVE,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.4
    });

    glowMaterialBack = new THREE.MeshStandardMaterial({
      color: 0x28200f,
      emissive: CONFIG.COLORS.GOLD_EMISSIVE,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.4
    });

    glowMaterialCore = new THREE.MeshStandardMaterial({
      color: 0x0f2938,
      emissive: CONFIG.COLORS.CYAN_EMISSIVE,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.4
    });

    // ۲. هولوگرام پرتره باکیفیت و اصیل فرانک فرجی بر مبنای دارایی‌های برند
    const texLoader = new THREE.TextureLoader();
    texLoader.load('/assets/aistudio/ChatGPT_Image_Sep_23__2026__12_16_16_PM_1baba08f.png', (texture) => {
      texture.minFilter = THREE.LinearFilter;
      const holoGeo = new THREE.PlaneGeometry(1.65, 2.3);
      const holoMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.98,
        side: THREE.DoubleSide
      });
      const holoMesh = new THREE.Mesh(holoGeo, holoMat);
      holoMesh.position.set(0, 1.15, 0.02);
      avatarGroup.add(holoMesh);

      // کادر حاشیه‌ای نوری هولوگرافیک
      const frameGeo = new THREE.EdgesGeometry(holoGeo);
      const frameMat = new THREE.LineBasicMaterial({
        color: CONFIG.COLORS.CYAN_EMISSIVE,
        transparent: true,
        opacity: 0.5
      });
      const frameLine = new THREE.LineSegments(frameGeo, frameMat);
      frameLine.position.copy(holoMesh.position);
      avatarGroup.add(frameLine);
    });

    // ۳. هاله نوری و حلقه‌های سایبرنتیک سر و بالاتنه
    const haloGeo = new THREE.TorusGeometry(0.55, 0.012, 16, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: CONFIG.COLORS.CYAN_EMISSIVE,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 1.95;
    halo.rotation.x = Math.PI / 2.3;
    avatarGroup.add(halo);

    // حلقه دوم هولوگرافیک طلایی لوتوس
    const halo2Geo = new THREE.TorusGeometry(0.72, 0.008, 16, 64);
    const halo2Mat = new THREE.MeshBasicMaterial({
      color: CONFIG.COLORS.GOLD_EMISSIVE,
      transparent: true,
      opacity: 0.6
    });
    const halo2 = new THREE.Mesh(halo2Geo, halo2Mat);
    halo2.position.y = 1.25;
    halo2.rotation.x = Math.PI / 2.5;
    avatarGroup.add(halo2);

    // ۴. نشانگرهای نوری عضلات هدف (سینه، پشت، شکم)
    chestGroup = new THREE.Group();
    const chestMarkerGeo = new THREE.RingGeometry(0.12, 0.16, 24);
    const chestMarkerL = new THREE.Mesh(chestMarkerGeo, glowMaterialChest);
    chestMarkerL.position.set(0.28, 1.35, 0.06);
    const chestMarkerR = new THREE.Mesh(chestMarkerGeo, glowMaterialChest);
    chestMarkerR.position.set(-0.28, 1.35, 0.06);
    chestGroup.add(chestMarkerL, chestMarkerR);
    avatarGroup.add(chestGroup);

    deltoidGroup = new THREE.Group();
    const deltMarkerGeo = new THREE.RingGeometry(0.1, 0.14, 20);
    const deltMarkerL = new THREE.Mesh(deltMarkerGeo, glowMaterialChest);
    deltMarkerL.position.set(0.65, 1.55, 0.05);
    const deltMarkerR = new THREE.Mesh(deltMarkerGeo, glowMaterialChest);
    deltMarkerR.position.set(-0.65, 1.55, 0.05);
    deltoidGroup.add(deltMarkerL, deltMarkerR);
    avatarGroup.add(deltoidGroup);

    backGroup = new THREE.Group();
    const backMarkerGeo = new THREE.PlaneGeometry(0.35, 0.5);
    const backMarker = new THREE.Mesh(backMarkerGeo, glowMaterialBack);
    backMarker.position.set(0, 1.25, -0.05);
    backGroup.add(backMarker);
    avatarGroup.add(backGroup);

    coreGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const coreBarGeo = new THREE.PlaneGeometry(0.4, 0.06);
      const coreBar = new THREE.Mesh(coreBarGeo, glowMaterialCore);
      coreBar.position.set(0, 0.95 - i * 0.12, 0.06);
      coreGroup.add(coreBar);
    }
    avatarGroup.add(coreGroup);

    // ۹. دمبل‌های تمرینی سه‌بعدی
    const dbHandleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 12);
    const dbWeightGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.06, 20);
    const dbMat = new THREE.MeshStandardMaterial({ color: 0x2d3a37, metalness: 0.8, roughness: 0.25 });

    dumbbellLeft = new THREE.Group();
    const handleL = new THREE.Mesh(dbHandleGeo, dbMat);
    handleL.rotation.z = Math.PI / 2;
    const wL1 = new THREE.Mesh(dbWeightGeo, dbMat);
    wL1.position.x = 0.15;
    wL1.rotation.z = Math.PI / 2;
    const wL2 = new THREE.Mesh(dbWeightGeo, dbMat);
    wL2.position.x = -0.15;
    wL2.rotation.z = Math.PI / 2;
    dumbbellLeft.add(handleL, wL1, wL2);
    dumbbellLeft.position.set(0.55, 0.25, 0.15);
    avatarGroup.add(dumbbellLeft);

    dumbbellRight = new THREE.Group();
    const handleR = new THREE.Mesh(dbHandleGeo, dbMat);
    handleR.rotation.z = Math.PI / 2;
    const wR1 = new THREE.Mesh(dbWeightGeo, dbMat);
    wR1.position.x = 0.15;
    wR1.rotation.z = Math.PI / 2;
    const wR2 = new THREE.Mesh(dbWeightGeo, dbMat);
    wR2.position.x = -0.15;
    wR2.rotation.z = Math.PI / 2;
    dumbbellRight.add(handleR, wR1, wR2);
    dumbbellRight.position.set(-0.55, 0.25, 0.15);
    avatarGroup.add(dumbbellRight);

    // ۱۰. استیج دایره‌ای پایه تمرین
    const floorGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.08, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x091211,
      roughness: 0.5,
      metalness: 0.3
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.04;
    avatarGroup.add(floor);

    // حلقه نوری زیر پای آواتار
    const ringGeo = new THREE.RingGeometry(1.4, 1.5, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: CONFIG.COLORS.GOLD_EMISSIVE,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    avatarGroup.add(ring);

    avatarGroup.position.set(0, -0.65, 0);
    scene.add(avatarGroup);
  }

  /* ==========================================================================
     ۷. سیستم اسلایدر بی‌نهایت برنامه‌ها (Jaipur City Infinite Slider Engine)
     ========================================================================== */
  function setupSightSlider() {
    if (!dom.sightsTrack || !dom.sightsSlider) return;

    // ۱. خواندن کارت‌های اولیه موجود در DOM
    const baseCards = Array.from(dom.sightsTrack.children);
    state.slider.originalCount = baseCards.length || 5;

    // ۲. کلون‌سازی کارت‌ها به ۳ مجموعه یکسان (مجموعه ۰، مجموعه ۱، مجموعه ۲ = ۱۵ کارت)
    // برای تضمین حلقه بی‌نهایت بدون وقفه بصری
    const set1 = baseCards.map((c) => c.cloneNode(true));
    const set2 = baseCards.map((c) => c.cloneNode(true));

    set1.forEach((clone) => dom.sightsTrack.appendChild(clone));
    set2.forEach((clone) => dom.sightsTrack.appendChild(clone));

    const allCards = Array.from(dom.sightsTrack.children);
    state.slider.totalCount = allCards.length;

    // ۳. شروع اسلایدر در اولین کارت مجموعه میانی (Index 5)
    state.slider.activeIndex = state.slider.originalCount;

    // ۴. اتصال هندلرهای کلیک به کلیه کارت‌ها برای باز کردن مودال برنامه
    allCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        selectSightCard(card, index);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectSightCard(card, index);
        }
      });
    });

    // ۵. دکمه‌های ناوبری قبلی و بعدی
    if (dom.btnPrev) {
      dom.btnPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        moveSightSlider(-1);
      });
    }
    if (dom.btnNext) {
      dom.btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        moveSightSlider(1);
      });
    }

    // ۶. نرمال‌سازی موقعیت اسلایدر پس از پایان ترنزیشن (TransitionEnd Normalization)
    dom.sightsTrack.addEventListener('transitionend', normalizeSightSlider);

    // ۷. پشتیبانی از کیبورد در اسلایدر
    window.addEventListener('keydown', (e) => {
      if (state.currentStage !== 'sights') return;
      if (e.key === 'ArrowLeft') {
        moveSightSlider(1);
      } else if (e.key === 'ArrowRight') {
        moveSightSlider(-1);
      }
    });

    // ۸. ژست لمسی و درگ اسلایدر
    dom.sightsSlider.addEventListener('pointerdown', (e) => {
      state.slider.touchStartX = e.clientX;
      state.slider.isDragging = true;
    }, { passive: true });

    window.addEventListener('pointerup', (e) => {
      if (!state.slider.isDragging) return;
      state.slider.isDragging = false;
      const deltaX = e.clientX - state.slider.touchStartX;
      if (Math.abs(deltaX) > 40) {
        if (deltaX < 0) {
          moveSightSlider(1);
        } else {
          moveSightSlider(-1);
        }
      }
    }, { passive: true });

    // اعمال موقعیت اولیه اسلایدر
    updateSightSlider(false);
  }

  /**
   * جابه‌جایی اسلایدر به اندازه یک گام
   */
  function moveSightSlider(direction) {
    state.slider.activeIndex += direction;
    updateSightSlider(true);
  }

  /**
   * محاسبه تغییر مکان افقی و اعمال ترنزیشن اسلایدر
   */
  function updateSightSlider(animate = true) {
    if (!dom.sightsTrack || !dom.sightsSlider) return;
    const cards = Array.from(dom.sightsTrack.children);
    if (!cards.length) return;

    const firstCard = cards[0];
    const cardRect = firstCard.getBoundingClientRect();
    const cardWidth = cardRect.width || 320;
    const gap = 24;
    const containerWidth = dom.sightsSlider.clientWidth || window.innerWidth;

    // مرکزسازی کارت فعال در عرض پنجره
    const centerOffset = (containerWidth - cardWidth) / 2;
    const shift = centerOffset - state.slider.activeIndex * (cardWidth + gap);

    if (!animate) {
      dom.sightsTrack.classList.add('is-jumping');
      dom.sightsTrack.style.transform = `translate3d(${shift}px, 0, 0)`;
      // اجبار به بازمحاسبه هندسی برای لغو انیمیشن
      dom.sightsTrack.getBoundingClientRect();
      requestAnimationFrame(() => {
        dom.sightsTrack.classList.remove('is-jumping');
      });
    } else {
      dom.sightsTrack.style.transform = `translate3d(${shift}px, 0, 0)`;
    }

    // به‌روزرسانی کلاس کارت فعال برای بازخورد بصری
    cards.forEach((c, idx) => {
      if (idx === state.slider.activeIndex) {
        c.classList.add('is-active-card');
      } else {
        c.classList.remove('is-active-card');
      }
    });
  }

  /**
   * جهش لحظه‌ای بدون انیمیشن به شاخص مقصد
   */
  function jumpSightSlider(targetIndex) {
    state.slider.activeIndex = targetIndex;
    updateSightSlider(false);
  }

  /**
   * نرمال‌سازی حلقه بی‌نهایت پس از هر حرکت ترنزیشن
   */
  function normalizeSightSlider() {
    const orig = state.slider.originalCount; // 5
    if (state.slider.activeIndex >= orig * 2) {
      // عبور از انتهای مجموعه دوم؛ پرش به کارت متناظر در مجموعه میانی
      jumpSightSlider(state.slider.activeIndex - orig);
    } else if (state.slider.activeIndex < orig) {
      // عبور از ابتدای مجموعه میانی به سمت چپ؛ پرش به مجموعه میانی
      jumpSightSlider(state.slider.activeIndex + orig);
    }
  }

  /**
   * انتخاب کارت و باز کردن پنجره مودال
   */
  function selectSightCard(card, index) {
    state.slider.activeIndex = index;
    updateSightSlider(true);

    const programId = card.getAttribute('data-program-id') || 'strength-hypertrophy';
    openProgramModal(programId);
  }

  /* ==========================================================================
     ۸. مدیریت مودال تعاملی برنامه‌های تمرینی (Program Modal Controller)
     ========================================================================== */
  function setupProgramModal() {
    if (!dom.programModal) return;

    if (dom.modalCloseBtn) {
      dom.modalCloseBtn.addEventListener('click', closeProgramModal);
    }

    // کلیک روی پس‌زمینه برای بستن مودال
    dom.programModal.addEventListener('click', (e) => {
      if (e.target === dom.programModal) {
        closeProgramModal();
      }
    });

    // بستن با دکمه Escape کیبورد
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.programModal.classList.contains('is-open')) {
        closeProgramModal();
      }
    });
  }

  function openProgramModal(programId) {
    const data = PROGRAMS_DATA[programId] || PROGRAMS_DATA['strength-hypertrophy'];

    if (dom.modalTitle) dom.modalTitle.textContent = data.title;
    if (dom.modalKicker) dom.modalKicker.textContent = data.kicker;
    if (dom.modalDesc) dom.modalDesc.textContent = data.desc;
    if (dom.modalSessions) dom.modalSessions.textContent = data.sessions;
    if (dom.modalLevel) dom.modalLevel.textContent = data.level;
    if (dom.modalFocus) dom.modalFocus.textContent = data.focus;

    dom.programModal.classList.add('is-open');
    dom.programModal.setAttribute('aria-hidden', 'false');

    if (dom.modalCloseBtn) {
      dom.modalCloseBtn.focus();
    }
  }

  function closeProgramModal() {
    if (!dom.programModal) return;
    dom.programModal.classList.remove('is-open');
    dom.programModal.setAttribute('aria-hidden', 'true');
  }

  /* ==========================================================================
     ۹. سیستم همگام‌سازی ویدیوهای تمرینی آپلودشده با پیشرفت اسکرول
     ========================================================================== */
  function syncExerciseVideos(chestActive, chestEnter, backActive, backEnter, coreActive, coreEnter) {
    // ۱. ویدیوی سینه و سرشانه
    if (dom.videoChest) {
      if (chestActive > 0.15) {
        if (dom.videoChest.paused) {
          dom.videoChest.play().catch(() => {});
        }
        if (dom.videoChest.duration) {
          const scrubTime = chestEnter * dom.videoChest.duration;
          if (Math.abs(dom.videoChest.currentTime - scrubTime) > 0.45) {
            dom.videoChest.currentTime = scrubTime;
          }
        }
      } else {
        if (!dom.videoChest.paused) {
          dom.videoChest.pause();
        }
      }
    }

    // ۲. ویدیوی روئینگ و عضلات پشت
    if (dom.videoBack) {
      if (backActive > 0.15) {
        if (dom.videoBack.paused) {
          dom.videoBack.play().catch(() => {});
        }
        if (dom.videoBack.duration) {
          const scrubTime = backEnter * dom.videoBack.duration;
          if (Math.abs(dom.videoBack.currentTime - scrubTime) > 0.45) {
            dom.videoBack.currentTime = scrubTime;
          }
        }
      } else {
        if (!dom.videoBack.paused) {
          dom.videoBack.pause();
        }
      }
    }

    // ۳. ویدیوی شکم و عضلات مرکزی
    if (dom.videoCore) {
      if (coreActive > 0.15) {
        if (dom.videoCore.paused) {
          dom.videoCore.play().catch(() => {});
        }
        if (dom.videoCore.duration) {
          const scrubTime = coreEnter * dom.videoCore.duration;
          if (Math.abs(dom.videoCore.currentTime - scrubTime) > 0.45) {
            dom.videoCore.currentTime = scrubTime;
          }
        }
      } else {
        if (!dom.videoCore.paused) {
          dom.videoCore.pause();
        }
      }
    }
  }

  /* ==========================================================================
     ۱۰. موتور اصلی اسکرول و سینماتیک حرکت (Scroll Progression & Cinematic Engine)
     ========================================================================== */
  function updateScrollProgressAndNarrative() {
    if (!dom.cinema) return;

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const rect = dom.cinema.getBoundingClientRect();
    const totalDist = dom.cinema.offsetHeight - window.innerHeight;

    // فاصله اسکرول داخل بخش سینمایی
    const p = clamp(scrollY, 0, Math.max(totalDist, 1));
    const progress = clamp(p / totalDist, 0, 1);

    state.scrollDistance = p;
    state.scrollProgress = progress;
    state.scrollDirection = p >= state.lastScrollDistance ? 1 : -1;
    state.lastScrollDistance = p;

    // به‌روزرسانی نوار پیشرفت در بالای صحنه
    if (dom.progressBar) {
      dom.progressBar.style.transform = `scaleX(${progress})`;
    }

    const T = CONFIG.SCENE_THRESHOLDS;

    // ۱. محاسبات فاز هیرو
    const heroExit = smoothstep(T.HERO.exitStart, T.HERO.exitEnd, p);
    const heroOpacity = 1 - heroExit;
    const heroY = -heroExit * 60;

    // ۲. محاسبات فاز سینه و سرشانه
    const chestEnter = smoothstep(T.CHEST.enterStart, T.CHEST.enterEnd, p);
    const chestExit = smoothstep(T.CHEST.exitStart, T.CHEST.exitEnd, p);
    const chestActive = chestEnter * (1 - chestExit);

    // ۳. محاسبات فاز پشت و زیر بغل
    const backEnter = smoothstep(T.BACK.enterStart, T.BACK.enterEnd, p);
    const backExit = smoothstep(T.BACK.exitStart, T.BACK.exitEnd, p);
    const backActive = backEnter * (1 - backExit);

    // ۴. محاسبات فاز شکم و عضلات مرکزی
    const coreEnter = smoothstep(T.CORE.enterStart, T.CORE.enterEnd, p);
    const coreExit = smoothstep(T.CORE.exitStart, T.CORE.exitEnd, p);
    const coreActive = coreEnter * (1 - coreExit);

    // ۵. محاسبات ورود اسلایدر برنامه‌ها (Sights Phase)
    const sightsEnter = smoothstep(T.SIGHTS.enterStart, T.SIGHTS.enterEnd, p);
    const sightsActive = sightsEnter;

    // به‌روزرسانی متغیرهای CSS ریشه
    if (dom.root) {
      dom.root.style.setProperty('--hero-opacity', heroOpacity.toFixed(3));
      dom.root.style.setProperty('--hero-y', `${heroY.toFixed(1)}px`);

      dom.root.style.setProperty('--panel1-opacity', chestActive.toFixed(3));
      dom.root.style.setProperty('--panel1-y', `${(1 - chestEnter) * 40 - chestExit * 40}px`);

      dom.root.style.setProperty('--panel2-opacity', backActive.toFixed(3));
      dom.root.style.setProperty('--panel2-y', `${(1 - backEnter) * 40 - backExit * 40}px`);

      dom.root.style.setProperty('--panel3-opacity', coreActive.toFixed(3));
      dom.root.style.setProperty('--panel3-y', `${(1 - coreEnter) * 40 - coreExit * 40}px`);

      dom.root.style.setProperty('--sights-opacity', sightsActive.toFixed(3));
      dom.root.style.setProperty('--sights-enter-x', `${((1 - sightsEnter) * 100).toFixed(1)}vw`);
    }

    // کنترل وضعیت تعاملی اسلایدر
    if (dom.sightsSlider && dom.sightsControls) {
      if (sightsEnter > 0.4) {
        dom.sightsSlider.classList.add('is-active');
        dom.sightsControls.classList.add('is-active');
      } else {
        dom.sightsSlider.classList.remove('is-active');
        dom.sightsControls.classList.remove('is-active');
      }
    }

    // همگام‌سازی ویدیوهای تمرینی آپلودشده
    syncExerciseVideos(chestActive, chestEnter, backActive, backEnter, coreActive, coreEnter);

    // به‌روزرسانی نشانگر مرحله و اطلاعات عضلات هدف در HUD
    updateHUDIndicators(heroOpacity, chestActive, backActive, coreActive, sightsActive);

    // هدایت سینمایی دوربین Three.js، اسکرابینگ حرکت و شدت نور عضلات
    updateThreeSceneState(p, chestEnter, chestActive, backEnter, backActive, coreEnter, coreActive, sightsEnter, sightsActive);
  }

  /**
   * به‌روزرسانی متون و نشانگرهای HUD
   */
  function updateHUDIndicators(heroOpacity, chestActive, backActive, coreActive, sightsActive) {
    if (sightsActive > 0.5) {
      state.currentStage = 'sights';
      if (dom.sceneNumber) dom.sceneNumber.textContent = '04';
      if (dom.sceneName) dom.sceneName.textContent = 'دوره‌ها و برنامه‌های تمرینی';
      if (dom.muscleLabel) dom.muscleLabel.textContent = 'سیستم یکپارچه عضلانی و هایپرتروفی جامع';
    } else if (backActive > 0.45) {
      state.currentStage = 'back-lats';
      if (dom.sceneNumber) dom.sceneNumber.textContent = '02';
      if (dom.sceneName) dom.sceneName.textContent = 'پشت و زیر بغل';
      if (dom.muscleLabel) dom.muscleLabel.textContent = 'عضلات هدف: پشتی بزرگ (Lats)، ذوزنقه‌ای و متوازی‌الاضلاع';
    } else if (coreActive > 0.45) {
      state.currentStage = 'core';
      if (dom.sceneNumber) dom.sceneNumber.textContent = '03';
      if (dom.sceneName) dom.sceneName.textContent = 'شکم و عضلات مرکزی';
      if (dom.muscleLabel) dom.muscleLabel.textContent = 'عضلات هدف: راست شکمی (Abs)، مایل‌ها و ثبات‌دهنده ستون فقرات';
    } else if (chestActive > 0.45) {
      state.currentStage = 'chest-shoulders';
      if (dom.sceneNumber) dom.sceneNumber.textContent = '01';
      if (dom.sceneName) dom.sceneName.textContent = 'سینه و سرشانه';
      if (dom.muscleLabel) dom.muscleLabel.textContent = 'عضلات هدف: پکتورالیس ماژور، دلتوئید قدامی و سهسر بازویی';
    } else {
      state.currentStage = 'hero';
      if (dom.sceneNumber) dom.sceneNumber.textContent = '00';
      if (dom.sceneName) dom.sceneName.textContent = 'پلتفرم لوتوس جیم';
      if (dom.muscleLabel) dom.muscleLabel.textContent = 'آناتومی هوشمند ورزشی فرانک فرجی';
    }
  }

  /**
   * به‌روزرسانی موقعیت دوربین، چرخش کاراکتر، اسکرابینگ حرکت و متریال عضلات
   */
  function updateThreeSceneState(scrollPx, chestEnter, chestActive, backEnter, backActive, coreEnter, coreActive, sightsEnter, sightsActive) {
    if (!state.threeReady || !camera || !avatarGroup) return;

    const KF = CONFIG.CAMERA_KEYFRAMES;

    let targetCamX = KF.hero.pos.x;
    let targetCamY = KF.hero.pos.y;
    let targetCamZ = KF.hero.pos.z;
    let targetRotY = KF.hero.avatarRotY;

    // ۱. اینترپولیشن پیوسته موقعیت دوربین بین فازها
    if (sightsActive > 0.05) {
      targetCamX = lerp(KF.core.pos.x, KF.sights.pos.x, sightsEnter);
      targetCamY = lerp(KF.core.pos.y, KF.sights.pos.y, sightsEnter);
      targetCamZ = lerp(KF.core.pos.z, KF.sights.pos.z, sightsEnter);
      targetRotY = lerp(KF.core.avatarRotY, KF.sights.avatarRotY, sightsEnter);
    } else if (backActive > 0.05) {
      targetCamX = lerp(KF.chest.pos.x, KF.back.pos.x, backEnter);
      targetCamY = lerp(KF.chest.pos.y, KF.back.pos.y, backEnter);
      targetCamZ = lerp(KF.chest.pos.z, KF.back.pos.z, backEnter);
      targetRotY = lerp(KF.chest.avatarRotY, KF.back.avatarRotY, backEnter);
    } else if (coreActive > 0.05) {
      targetCamX = KF.core.pos.x;
      targetCamY = KF.core.pos.y;
      targetCamZ = KF.core.pos.z;
      targetRotY = KF.core.avatarRotY;
    } else if (chestActive > 0.05) {
      targetCamX = lerp(KF.hero.pos.x, KF.chest.pos.x, chestEnter);
      targetCamY = lerp(KF.hero.pos.y, KF.chest.pos.y, chestEnter);
      targetCamZ = lerp(KF.hero.pos.z, KF.chest.pos.z, chestEnter);
      targetRotY = KF.chest.avatarRotY;
    }

    // اعمال اثر پارالاکس نشانگر ماوس (غیرفعال در حالت reduced-motion)
    const mx = state.reduceMotion ? 0 : state.mouseX;
    const my = state.reduceMotion ? 0 : state.mouseY;

    camera.position.x = lerp(camera.position.x, targetCamX + mx * 0.35, 0.08);
    camera.position.y = lerp(camera.position.y, targetCamY - my * 0.25, 0.08);
    camera.position.z = lerp(camera.position.z, targetCamZ, 0.08);

    avatarGroup.rotation.y = lerp(avatarGroup.rotation.y, targetRotY + mx * 0.15, 0.08);
    camera.lookAt(0, 0.22, 0);

    // ۲. برجسته‌سازی نوری عضلات هدف (Emissive Intensity Scrubbing)
    if (glowMaterialChest) {
      glowMaterialChest.emissiveIntensity = 0.25 + chestActive * 2.2 + (sightsActive > 0.3 ? 1.0 : 0);
    }
    if (glowMaterialBack) {
      glowMaterialBack.emissiveIntensity = 0.25 + backActive * 2.4 + (sightsActive > 0.3 ? 1.0 : 0);
    }
    if (glowMaterialCore) {
      glowMaterialCore.emissiveIntensity = 0.25 + coreActive * 2.4 + (sightsActive > 0.3 ? 1.0 : 0);
    }

    // ۳. اسکرابینگ حرکتی رفت‌وبرگشتی دمبل‌ها متناسب با اسکرول (Bidirectional Scrubbing)
    if (dumbbellLeft && dumbbellRight) {
      const pressCycle = Math.sin(scrollPx * 0.012) * 0.14 * chestActive;
      dumbbellLeft.position.z = 0.1 + pressCycle;
      dumbbellRight.position.z = 0.1 + pressCycle;

      const rowPull = Math.cos(scrollPx * 0.01) * 0.15 * backActive;
      dumbbellLeft.position.y = 0.9 + rowPull;
      dumbbellRight.position.y = 0.9 + rowPull;
    }

    // ۴. اسکرابینگ انیمیشن اسکلتی اگر میکسر فعال باشد
    if (mixer) {
      const localScrubTime = state.scrollProgress * 5.0;
      mixer.setTime(localScrubTime);
    }
  }

  /* ==========================================================================
     ۱۱. حلقه رندر اصلی و عملکرد (Main Render Loop)
     ========================================================================== */
  function renderLoop() {
    requestAnimationFrame(renderLoop);

    // اینترپولیشن پیوسته ماوس
    state.mouseX = lerp(state.mouseX, state.targetMouseX, 0.1);
    state.mouseY = lerp(state.mouseY, state.targetMouseY, 0.1);

    // اجرای محاسبات اسکرول و سینمایی
    updateScrollProgressAndNarrative();

    // رندر فریم WebGL
    if (state.threeReady && renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  /* ==========================================================================
     ۱۲. مدیریت تغییر ابعاد و ریسپانسیو (Resize & Viewport Handling)
     ========================================================================== */
  function handleResize() {
    if (state.threeReady && renderer && camera) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    updateSightSlider(false);
  }

  /* ==========================================================================
     ۱۳. مدیریت خطا و وضعیت بارگذاری (Error & Context Handling)
     ========================================================================== */
  function updateLoadingHUD(msg) {
    if (dom.sceneLoading) {
      dom.sceneLoading.textContent = msg;
      dom.sceneLoading.classList.remove('is-hidden');
    }
  }

  function hideLoadingHUD() {
    if (dom.sceneLoading) {
      dom.sceneLoading.classList.add('is-hidden');
    }
  }

  function handleContextLost(e) {
    e.preventDefault();
    console.warn('[Lotus Gym 3D] کانتکست WebGL موقتاً قطع شد.');
    state.threeReady = false;
  }

  function handleContextRestored() {
    console.log('[Lotus Gym 3D] کانتکست WebGL بازیابی شد.');
    initThreeScene();
  }

  /* ==========================================================================
     ۱۴. مقداردهی اولیه برنامه (Initialization)
     ========================================================================== */
  function init() {
    dom.cinema = document.getElementById('cinema');
    dom.root = document.documentElement;
    dom.sceneLoading = document.getElementById('scene-loading');
    dom.progressBar = document.querySelector('.scene-progress-bar');
    dom.sceneNumber = document.querySelector('.scene-number');
    dom.sceneName = document.querySelector('.scene-name');
    dom.muscleLabel = document.querySelector('.muscle-highlight-label');
    dom.heroCopy = document.querySelector('.Hero-copy');
    dom.panelChest = document.getElementById('chest-shoulders');
    dom.panelBack = document.getElementById('back-lats');
    dom.panelCore = document.getElementById('core');

    // المان‌های اسلایدر بی‌نهایت و مودال
    dom.sightsSlider = document.getElementById('sights-slider') || document.querySelector('.sights-slider');
    dom.sightsTrack = document.getElementById('sights-track') || document.querySelector('.sights-track');
    dom.sightsControls = document.getElementById('sights-controls') || document.querySelector('.sights-controls');
    dom.btnPrev = document.querySelector('.sight-prev');
    dom.btnNext = document.querySelector('.sight-next');

    dom.programModal = document.getElementById('program-modal');
    dom.modalCloseBtn = document.querySelector('.modal-close-btn');
    dom.modalTitle = document.getElementById('modal-title');
    dom.modalKicker = document.getElementById('modal-kicker');
    dom.modalDesc = document.getElementById('modal-desc');
    dom.modalSessions = document.getElementById('modal-sessions');
    dom.modalLevel = document.getElementById('modal-level');
    dom.modalFocus = document.getElementById('modal-focus');

    // المان‌های ویدیوهای تمرینی آپلودشده
    dom.videoChest = document.getElementById('video-chest');
    dom.videoBack = document.getElementById('video-back');
    dom.videoCore = document.getElementById('video-core');

    // بررسی تنظیمات کاهش حرکت سیستم‌عامل کاربر
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    state.reduceMotion = motionQuery.matches;
    motionQuery.addEventListener('change', (e) => {
      state.reduceMotion = e.matches;
    });

    // ثبت شنونده‌های تعاملی با عملکرد بهینه
    window.addEventListener(
      'pointermove',
      (e) => {
        if (state.reduceMotion) return;
        state.targetMouseX = e.clientX / window.innerWidth - 0.5;
        state.targetMouseY = e.clientY / window.innerHeight - 0.5;
      },
      { passive: true }
    );

    window.addEventListener('resize', handleResize, { passive: true });

    // راه‌اندازی صحنه سه‌بعدی
    initThreeScene();

    // راه‌اندازی اسلایدر بی‌نهایت برنامه‌ها
    setupSightSlider();

    // راه‌اندازی مودال برنامه‌ها
    setupProgramModal();

    // شروع حلقه رندر
    renderLoop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
