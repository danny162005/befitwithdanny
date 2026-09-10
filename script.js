const reactionButton = document.getElementById("reaction-button");
const reactionStatus = document.getElementById("reaction-status");
const bmrForm = document.getElementById("bmr-form");
const bmrResult = document.getElementById("bmr-result");
const heroVisual = document.querySelector(".hero-visual");
const floatingCard = document.querySelector(".floating-card");
const revealElements = document.querySelectorAll(".reveal");
const countElements = document.querySelectorAll("[data-count]");
const siteHeader = document.querySelector(".site-header");
const hero = document.querySelector(".hero");

let reactionStart = 0;
let reactionTimeout = null;
let waitingForReaction = false;

if (reactionButton && reactionStatus) {
  reactionButton.addEventListener("click", () => {
    if (!waitingForReaction) {
      waitingForReaction = true;
      reactionButton.classList.remove("ready");
      reactionButton.textContent = "Wait for green...";
      reactionStatus.textContent = "Get ready...";

      const delay = Math.floor(Math.random() * 2500) + 1500;
      reactionTimeout = window.setTimeout(() => {
        reactionStart = performance.now();
        reactionButton.classList.add("ready");
        reactionButton.textContent = "Click!";
        reactionStatus.textContent = "Now!";
      }, delay);

      return;
    }

    if (!reactionButton.classList.contains("ready")) {
      window.clearTimeout(reactionTimeout);
      waitingForReaction = false;
      reactionButton.textContent = "Start Challenge";
      reactionStatus.textContent = "Too early. Try again.";
      return;
    }

    const reactionTime = Math.round(performance.now() - reactionStart);
    waitingForReaction = false;
    reactionButton.classList.remove("ready");
    reactionButton.textContent = "Try Again";
    reactionStatus.textContent = `Your reaction time: ${reactionTime} ms`;
  });
}

if (bmrForm && bmrResult) {
  bmrForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(bmrForm);
    const gender = formData.get("gender");
    const age = Number(formData.get("age"));
    const height = Number(formData.get("height"));
    const weight = Number(formData.get("weight"));
    const activity = Number(formData.get("activity"));

    if (!age || !height || !weight || !activity) {
      bmrResult.textContent = "Please fill in all fields correctly.";
      return;
    }

    const baseBmr =
      gender === "female"
        ? 10 * weight + 6.25 * height - 5 * age - 161
        : 10 * weight + 6.25 * height - 5 * age + 5;

    const maintenanceCalories = Math.round(baseBmr * activity);
    const fatLossCalories = Math.round(maintenanceCalories - 350);
    const muscleGainCalories = Math.round(maintenanceCalories + 250);

    bmrResult.innerHTML = `
      <strong>Your Nutrition Plan</strong><br>
      BMR: ${Math.round(baseBmr)} kcal/day<br>
      Maintenance: ${maintenanceCalories} kcal/day<br>
      Fat Loss Target: ${fatLossCalories} kcal/day<br>
      Muscle Gain Target: ${muscleGainCalories} kcal/day
    `;
  });
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const animateCount = (element) => {
  if (element.dataset.counted === "true") {
    return;
  }

  const target = Number(element.dataset.count);

  if (!target || Number.isNaN(target)) {
    return;
  }

  element.dataset.counted = "true";

  const suffix = element.textContent.includes("+") ? "+" : "";
  const duration = 1800;
  const startTime = performance.now();

  const step = (now) => {
    const linear = Math.min((now - startTime) / duration, 1);
    const eased = easeOutCubic(linear);
    const value = Math.floor(eased * target);
    element.textContent = `${value}${suffix}`;

    if (linear < 1) {
      window.requestAnimationFrame(step);
      return;
    }

    element.textContent = `${target}${suffix}`;
  };

  window.requestAnimationFrame(step);
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");

        if (entry.target.hasAttribute("data-count")) {
          animateCount(entry.target);
        }

        const nestedCounts = entry.target.querySelectorAll?.("[data-count]");
        nestedCounts?.forEach((item) => animateCount(item));
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -60px 0px",
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
  countElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
  countElements.forEach((element) => animateCount(element));
}

if (heroVisual && floatingCard && window.matchMedia("(pointer: fine)").matches) {
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let animating = false;

  heroVisual.addEventListener("mousemove", (event) => {
    const bounds = heroVisual.getBoundingClientRect();
    targetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    targetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    if (!animating) {
      animating = true;
      const lerpStep = () => {
        mouseX += (targetX - mouseX) * 0.08;
        mouseY += (targetY - mouseY) * 0.08;

        heroVisual.style.transform = `
          translate3d(0, calc(var(--scrollRatio) * -22px), 0)
          perspective(1200px)
          rotateY(${mouseX * 6}deg)
          rotateX(${mouseY * -6}deg)
        `;
        if (floatingCard) {
          floatingCard.style.transform = `translate(${mouseX * 14}px, ${mouseY * 14}px)`;
        }

        if (Math.abs(targetX - mouseX) > 0.002 || Math.abs(targetY - mouseY) > 0.002) {
          window.requestAnimationFrame(lerpStep);
        } else {
          animating = false;
        }
      };
      window.requestAnimationFrame(lerpStep);
    }
  });

  heroVisual.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
    if (!animating) {
      animating = true;
      const resetStep = () => {
        mouseX += (0 - mouseX) * 0.12;
        mouseY += (0 - mouseY) * 0.12;

        heroVisual.style.transform = `
          translate3d(0, calc(var(--scrollRatio) * -22px), 0)
          perspective(1200px)
          rotateY(${mouseX * 6}deg)
          rotateX(${mouseY * -6}deg)
        `;
        if (floatingCard) {
          floatingCard.style.transform = `translate(${mouseX * 14}px, ${mouseY * 14}px)`;
        }

        if (Math.abs(mouseX) > 0.002 || Math.abs(mouseY) > 0.002) {
          window.requestAnimationFrame(resetStep);
        } else {
          heroVisual.style.transform = "";
          if (floatingCard) floatingCard.style.transform = "";
          animating = false;
        }
      };
      window.requestAnimationFrame(resetStep);
    }
  });
}

const root = document.documentElement;
let ticking = false;

const onScroll = () => {
  const scrollY = window.scrollY || window.pageYOffset;
  const heroHeight = hero ? hero.offsetHeight : window.innerHeight;
  const scrollRatio = Math.max(0, Math.min(1, scrollY / heroHeight));

  root.style.setProperty("--scrollY", `${scrollY}px`);
  root.style.setProperty("--scrollRatio", scrollRatio.toFixed(4));

  if (siteHeader) {
    if (scrollY > 12) {
      siteHeader.classList.add("scrolled");
    } else {
      siteHeader.classList.remove("scrolled");
    }
  }

  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  },
  { passive: true }
);

onScroll();

const sectionObs = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.setProperty("--in-view", "1");
          }
        });
      },
      { threshold: 0.2 }
    )
  : null;

document
  .querySelectorAll(".section")
  .forEach((sec) => {
    sec.style.setProperty("--in-view", "0");
    sectionObs?.observe(sec);
  });
