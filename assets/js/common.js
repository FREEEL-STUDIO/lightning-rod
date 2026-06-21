// gsap共通 ::::::::::::::::::::::::::::::::::::::
if (window.gsap && window.ScrollTrigger && window.Draggable) {
	gsap.registerPlugin(ScrollTrigger, Draggable);
}

const runLater = (callback, timeout = 1) => {
	if ('requestIdleCallback' in window) {
		requestIdleCallback(callback, { timeout });
		return;
	}

	setTimeout(callback, timeout);
};

document.addEventListener('DOMContentLoaded', () => {
	initHero();
	initHamburger();

	runLater(() => {
		initFadeUp();
		initHeadingAnimation();
		initOverviewGallery();
		initTabs();
		initCounter();
		initCtaVideo();
		initFloatCta()
	}, 200);

	runLater(() => {
		initMarquee();
		initTableHover();
		initScrollHint();
		initDragScroll();
		initModal();
		initTableToggle();
	}, 600);
});

// hero起点：header切り替え・hero動画制御 ::::::::::::::::::::::::::::::::::::::
function initHero() {
	const hero = document.querySelector('.hero');
	if (!hero) return;

	const header = document.querySelector('.header');
	const video = document.getElementById('heroVideo');
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let isInView = false;

	const playVideo = () => {
		if (!video || prefersReducedMotion || document.hidden) return;

		if (!video.src && video.dataset.src) video.src = video.dataset.src;
		video.play().catch(() => { });
	};

	const observer = new IntersectionObserver(([entry]) => {
		isInView = entry.isIntersecting;

		header?.classList.toggle('is-passed', !isInView);

		if (!video || prefersReducedMotion) return;

		if (isInView) {
			playVideo();
			return;
		}

		video.pause();
	}, { threshold: 0.2 });

	observer.observe(hero);

	document.addEventListener('visibilitychange', () => {
		if (!video || prefersReducedMotion) return;

		if (document.hidden) {
			video.pause();
		} else if (isInView) {
			playVideo();
		}
	});
}

// ハンバーガーメニュー ::::::::::::::::::::::::::::::::::::::
function initHamburger() {
	const btn = document.querySelector('.hamburger__btn');
	const nav = document.querySelector('.header__nav');
	if (!btn || !nav) return;

	const links = nav.querySelectorAll('.header__nav-list li a');

	const setMenuState = (isOpen) => {
		btn.classList.toggle('is-active', isOpen);
		nav.classList.toggle('is-active', isOpen);
		document.body.classList.toggle('is-open', isOpen);
		btn.setAttribute('aria-expanded', String(isOpen));
		btn.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
	};

	btn.addEventListener('click', () => {
		setMenuState(!btn.classList.contains('is-active'));
	});

	links.forEach(link => {
		link.addEventListener('click', () => setMenuState(false));
	});
}

// 下からふわっと登場 ::::::::::::::::::::::::::::::::::::::
function initFadeUp() {
	const targets = document.querySelectorAll('.js-fade-up');
	if (!targets.length) return;

	const fadeObserver = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (!entry.isIntersecting) return;

			entry.target.classList.add('is-show');
			fadeObserver.unobserve(entry.target);
		});
	}, { threshold: 0.2 });

	targets.forEach(target => fadeObserver.observe(target));
}

// タイトルアニメーション ::::::::::::::::::::::::::::::::::::::
function initHeadingAnimation() {
	if (!window.gsap || !window.ScrollTrigger) return;

	const headings = document.querySelectorAll('.c-heading-lv1');
	if (!headings.length) return;

	const showHeading = (heading) => {
		const mainEl = heading.querySelector('.c-heading-lv1__main');
		const subEl = heading.querySelector('.c-heading-lv1__sub');
		if (!mainEl) return;

		gsap.set(mainEl, { opacity: 1, x: 0 });
		gsap.set(mainEl.querySelectorAll('.js-letter'), { opacity: 1, y: 0, scaleY: 1 });
		if (subEl) gsap.set(subEl, { opacity: 1, x: 0 });
	};

	ScrollTrigger.matchMedia({
		'(min-width: 901px)': () => {
			headings.forEach(heading => {
				const mainEl = heading.querySelector('.c-heading-lv1__main');
				const subEl = heading.querySelector('.c-heading-lv1__sub');
				if (!mainEl) return;

				if (!mainEl.classList.contains('is-splitted')) {
					const fragment = document.createDocumentFragment();

					Array.from(mainEl.textContent).forEach(char => {
						if (/\s/.test(char)) {
							fragment.append(document.createTextNode(char));
							return;
						}

						const span = document.createElement('span');
						span.className = 'js-letter';
						span.textContent = char;
						fragment.append(span);
					});

					mainEl.replaceChildren(fragment);
					mainEl.classList.add('is-splitted');
				}

				const letters = mainEl.querySelectorAll('.js-letter');

				gsap.set(mainEl, { opacity: 0, x: -30 });
				gsap.set(letters, { opacity: 0, y: 30, scaleY: 0.9 });
				if (subEl) gsap.set(subEl, { opacity: 0, x: -30 });

				const tl = gsap.timeline({
					scrollTrigger: {
						trigger: heading,
						start: 'top 70%',
						once: true
					}
				});

				tl.to(mainEl, {
					opacity: 1,
					x: 0,
					duration: 0.8,
					ease: 'power3.out'
				});

				tl.to(letters, {
					opacity: 1,
					y: 0,
					scaleY: 1,
					duration: 0.8,
					ease: 'power4.out',
					stagger: 0.05
				}, '-=0.6');

				if (subEl) {
					tl.to(subEl, {
						opacity: 1,
						x: 0,
						duration: 0.6,
						ease: 'power4.out'
					}, '-=0.7');
				}
			});
		},
		'(max-width: 900px)': () => {
			headings.forEach(showHeading);
		}
	});

	ScrollTrigger.refresh();
}

// overviewスッと上に抜けるアニメーション ::::::::::::::::::::::::::::::::::::::
function initOverviewGallery() {
	if (!window.gsap || !window.ScrollTrigger) return;

	const cases = document.querySelectorAll('.overview__case');
	if (!cases.length) return;

	const galleries = [];

	cases.forEach(caseEl => {
		const sets = caseEl.querySelectorAll('.js-gallery-y');
		if (!sets.length) return;

		const tl = gsap.timeline({
			paused: true,
			repeat: -1
		});

		sets.forEach(set => {
			const children = set.querySelectorAll('.overview__case-image, .overview__case-content');

			tl
				.to(set, {
					opacity: 1,
					y: 0,
					duration: 1,
					ease: 'power2.out'
				})
				.to(children, {
					opacity: 1,
					y: 0,
					stagger: 0.15,
					duration: 0.8,
					ease: 'power3.out'
				}, '-=0.6')
				.to({}, { duration: 2.5 })
				.to(children, {
					opacity: 0,
					y: '-20%',
					stagger: 0.15,
					duration: 0.6,
					ease: 'power1.in'
				})
				.to(set, {
					opacity: 0,
					y: '-15%',
					duration: 0.7,
					ease: 'power1.in'
				}, '-=0.6');
		});

		const gallery = { tl, isInView: false };
		galleries.push(gallery);

		ScrollTrigger.create({
			trigger: caseEl,
			start: 'top bottom',
			end: 'bottom top',
			onEnter: () => {
				gallery.isInView = true;
				if (!document.hidden) tl.play();
			},
			onEnterBack: () => {
				gallery.isInView = true;
				if (!document.hidden) tl.play();
			},
			onLeave: () => {
				gallery.isInView = false;
				tl.pause();
			},
			onLeaveBack: () => {
				gallery.isInView = false;
				tl.pause();
			}
		});
	});

	document.addEventListener('visibilitychange', () => {
		galleries.forEach(({ tl, isInView }) => {
			if (document.hidden) {
				tl.pause();
			} else if (isInView) {
				tl.play();
			}
		});
	});
}

// タブ切り替え ::::::::::::::::::::::::::::::::::::::
function initTabs() {
	const tabs = document.querySelectorAll('.js-tab');
	const contents = document.querySelectorAll('.js-tab-content');
	if (!tabs.length || !contents.length) return;

	const activateTab = (btn, shouldFocus = false) => {
		const target = document.getElementById(btn.dataset.target);
		if (!target) return;

		tabs.forEach(tab => {
			const isCurrent = tab === btn;
			tab.classList.toggle('is-active', isCurrent);
			tab.setAttribute('aria-selected', String(isCurrent));
			tab.setAttribute('tabindex', isCurrent ? '0' : '-1');
		});

		contents.forEach(content => {
			const isCurrent = content === target;
			content.classList.toggle('is-active', isCurrent);
			content.toggleAttribute('hidden', !isCurrent);
		});

		if (shouldFocus) btn.focus();
	};

	tabs.forEach((btn, index) => {
		btn.setAttribute('tabindex', btn.classList.contains('is-active') ? '0' : '-1');

		btn.addEventListener('click', () => activateTab(btn));

		btn.addEventListener('keydown', e => {
			const keyMap = {
				ArrowRight: (index + 1) % tabs.length,
				ArrowDown: (index + 1) % tabs.length,
				ArrowLeft: (index - 1 + tabs.length) % tabs.length,
				ArrowUp: (index - 1 + tabs.length) % tabs.length,
				Home: 0,
				End: tabs.length - 1
			};

			if (!(e.key in keyMap)) return;

			e.preventDefault();
			activateTab(tabs[keyMap[e.key]], true);
		});
	});

	contents.forEach(content => {
		content.toggleAttribute('hidden', !content.classList.contains('is-active'));
	});
}


// GSAPスライド マルキー ::::::::::::::::::::::::::::::::::::::
function initMarquee() {
	if (!window.gsap || !window.ScrollTrigger || !window.Draggable) return;

	const marqueeEl = document.querySelector('.js-marquee');
	if (!marqueeEl) return;

	const wrapper = marqueeEl.querySelector('.case__list');
	const scrollbar = marqueeEl.querySelector('.js-marquee-scrollbar');
	const thumb = marqueeEl.querySelector('.js-marquee-scrollbar-thumb');
	if (!wrapper || !scrollbar || !thumb) return;

	const slides = Array.from(wrapper.children);
	if (!slides.length) return;

	slides.slice(0, 4).forEach(slide => {
		wrapper.appendChild(slide.cloneNode(true));
	});

	const moveWidth = slides.reduce((width, slide) => width + slide.getBoundingClientRect().width, 0);
	const maxThumbX = scrollbar.offsetWidth - thumb.offsetWidth;
	if (moveWidth <= 0 || maxThumbX <= 0) return;

	const marqueeTween = gsap.to(wrapper, {
		x: `-=${moveWidth}`,
		duration: 80,
		ease: 'none',
		repeat: -1,
		paused: true,
		modifiers: {
			x: gsap.utils.unitize(x => parseFloat(x) % moveWidth)
		}
	});
	let isInView = false;

	const playMarquee = () => {
		if (!document.hidden) marqueeTween.play();
	};

	ScrollTrigger.create({
		trigger: marqueeEl,
		start: 'top bottom',
		end: 'bottom top',
		onEnter: () => {
			isInView = true;
			playMarquee();
		},
		onEnterBack: () => {
			isInView = true;
			playMarquee();
		},
		onLeave: () => {
			isInView = false;
			marqueeTween.pause();
		},
		onLeaveBack: () => {
			isInView = false;
			marqueeTween.pause();
		}
	});

	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			marqueeTween.pause();
		} else if (isInView) {
			playMarquee();
		}
	});

	Draggable.create(thumb, {
		type: 'x',
		bounds: { minX: 0, maxX: maxThumbX },
		onPress() {
			marqueeTween.pause();
		},
		onDrag() {
			marqueeTween.progress(this.x / maxThumbX);
		},
		onRelease() {
			if (!document.hidden && isInView) marqueeTween.resume();
		}
	});

	const step = maxThumbX * 0.2;

	marqueeEl.querySelector('.js-marquee-arrow-prev')
		?.addEventListener('click', () => moveBy(-step));

	marqueeEl.querySelector('.js-marquee-arrow-next')
		?.addEventListener('click', () => moveBy(step));

	function moveBy(deltaX) {
		marqueeTween.pause();

		const nextX = gsap.utils.clamp(
			0,
			maxThumbX,
			Number(gsap.getProperty(thumb, 'x')) + deltaX
		);

		gsap.to(thumb, {
			x: nextX,
			duration: 0.3,
			ease: 'power2.out',
			onUpdate() {
				marqueeTween.progress(Number(gsap.getProperty(thumb, 'x')) / maxThumbX);
			},
			onComplete() {
				if (!document.hidden && isInView) marqueeTween.resume();
			}
		});
	}
}

// 表のホバークロス ::::::::::::::::::::::::::::::::::::::
function initTableHover() {
	const table = document.querySelector('.js-cross-cell');
	if (!table) return;

	const cells = Array.from(table.querySelectorAll('td, th'));
	const rows = Array.from(table.rows);
	let currentCell = null;
	let ticking = false;

	const clearHighlight = () => {
		cells.forEach(cell => cell.classList.remove('js-highlight', 'js-highlight-cross'));
	};

	table.addEventListener('mousemove', e => {
		const cell = e.target.closest('td, th');
		if (!cell || cell === currentCell || !table.contains(cell)) return;

		currentCell = cell;
		if (ticking) return;
		ticking = true;

		requestAnimationFrame(() => {
			const colIndex = currentCell.cellIndex;
			const row = currentCell.parentElement;

			clearHighlight();

			if (row.parentElement.tagName === 'THEAD') {
				currentCell.classList.add('js-highlight');
			} else {
				Array.from(row.cells).forEach(rowCell => rowCell.classList.add('js-highlight'));
				currentCell.classList.add('js-highlight-cross');
			}

			rows.forEach(tableRow => {
				const colCell = tableRow.cells[colIndex];
				if (colCell && colCell !== currentCell) colCell.classList.add('js-highlight');
			});

			ticking = false;
		});
	});

	table.addEventListener('mouseleave', () => {
		currentCell = null;
		clearHighlight();
	});
}

// 表のスクロールヒント ::::::::::::::::::::::::::::::::::::::
function initScrollHint() {
	const hint = document.querySelector('.js-scroll-hint');
	const target = document.querySelector('.js-scroll-target');
	if (!hint || !target) return;

	const observer = new IntersectionObserver(([entry]) => {
		if (!entry.isIntersecting) return;

		hint.classList.add('is-visible');

		setTimeout(() => {
			hint.style.transition = 'opacity 0.3s';
			hint.style.opacity = '0';
		}, 2300);

		observer.disconnect();
	}, { threshold: 0.3 });

	observer.observe(target);
}

// 表のドラッグスクロール ::::::::::::::::::::::::::::::::::::::
function initDragScroll() {
	const dragScrollEl = document.querySelector('.js-drag-scroll');
	if (!dragScrollEl) return;

	let isDown = false;
	let startX = 0;
	let scrollLeft = 0;

	const endDrag = () => {
		isDown = false;
		dragScrollEl.classList.remove('is-dragging');
	};

	dragScrollEl.addEventListener('pointerdown', (e) => {
		if (e.pointerType === 'mouse' && e.button !== 0) return;

		isDown = true;
		startX = e.clientX;
		scrollLeft = dragScrollEl.scrollLeft;
		dragScrollEl.classList.add('is-dragging');
		dragScrollEl.setPointerCapture(e.pointerId);
	});

	dragScrollEl.addEventListener('pointermove', (e) => {
		if (!isDown) return;

		e.preventDefault();
		dragScrollEl.scrollLeft = scrollLeft - (e.clientX - startX);
	});

	dragScrollEl.addEventListener('pointerup', endDrag);
	dragScrollEl.addEventListener('pointercancel', endDrag);
	dragScrollEl.addEventListener('lostpointercapture', endDrag);
}

// モーダルウィンドウ ::::::::::::::::::::::::::::::::::::::
function initModal() {
	const modal = document.getElementById('commonModal');
	if (!modal) return;

	const modalBody = modal.querySelector('.js-modal__body');
	const modalContent = modal.querySelector('.js-modal__content');
	const closeButton = modal.querySelector('.js-modal__close');
	if (!modalBody || !modalContent) return;
	let lastTrigger = null;

	document.querySelectorAll('[data-modal-target]').forEach(trigger => {
		const heading = trigger.querySelector('.js-modal-content :is(h2, h3, h4)');
		const label = heading?.textContent?.trim() || 'Open details';

		trigger.setAttribute('role', 'button');
		trigger.setAttribute('tabindex', '0');
		trigger.setAttribute('aria-haspopup', 'dialog');
		trigger.setAttribute('aria-label', label);

		trigger.addEventListener('keydown', e => {
			if (e.key !== 'Enter' && e.key !== ' ') return;

			e.preventDefault();
			trigger.click();
		});
	});

	document.addEventListener('click', e => {
		const trigger = e.target.closest('[data-modal-target]');
		if (!trigger) return;

		const selector = trigger.dataset.modalTarget;
		const inner = selector ? trigger.querySelector(selector) : null;
		if (!inner) return;

		lastTrigger = trigger;
		modalBody.innerHTML = inner.innerHTML;
		modalBody.querySelectorAll('iframe[data-src]').forEach(iframe => {
			iframe.src = iframe.dataset.src;
		});
		modal.showModal();
		closeButton?.focus();

		modalContent.animate(
			[
				{ opacity: 0, transform: 'scale(0.95)' },
				{ opacity: 1, transform: 'scale(1)' }
			],
			{ duration: 200, easing: 'ease-out' }
		);
	});

	modal.addEventListener('click', e => {
		if (e.target !== modal && !e.target.closest('.js-modal__close')) return;

		modalContent
			.animate(
				[
					{ opacity: 1, transform: 'scale(1)' },
					{ opacity: 0, transform: 'scale(0.95)' }
				],
				{ duration: 200, easing: 'ease-in' }
			)
			.finished.then(() => {
				modal.close();
				modalBody.innerHTML = '';
				lastTrigger?.focus();
			});
	});
}

// ×で非表示＆表示 ::::::::::::::::::::::::::::::::::::::
function initTableToggle() {
	const table = document.querySelector('.js-cross-cell');
	if (!table) return;

	const initialWidth = table.offsetWidth;

	table.querySelectorAll('.js-close').forEach(button => {
		const cell = button.closest('td, th');
		if (!cell) return;

		const labelText = cell.querySelector('.product__name')?.textContent || cell.childNodes[0]?.textContent || '';
		const label = labelText.replace(/\s+/g, ' ').trim() || 'this item';
		button.setAttribute('aria-label', `Hide ${label}`);
	});

	table.addEventListener('click', e => {
		const closeButton = e.target.closest('.js-close');
		const reloadButton = e.target.closest('.js-reload button');

		if (closeButton) {
			const cell = closeButton.closest('td, th');
			if (!cell) return;

			const colIndex = Array.from(cell.parentNode.children).indexOf(cell);

			if (cell.closest('thead')) {
				const colWidth = cell.offsetWidth;

				table.querySelectorAll('tr').forEach(row => {
					const targetCell = row.children[colIndex];
					targetCell?.classList.add('js-hidden');
					targetCell?.setAttribute('aria-hidden', 'true');
				});

				table.style.width = `${table.offsetWidth - colWidth}px`;
			} else if (cell.closest('tbody')) {
				const row = cell.closest('tr');
				row?.classList.add('js-hidden');
				row?.setAttribute('aria-hidden', 'true');
			}
		}

		if (reloadButton) {
			table.querySelectorAll('.js-hidden').forEach(el => {
				el.classList.remove('js-hidden');
				el.removeAttribute('aria-hidden');
			});
			table.style.width = `${initialWidth}px`;
		}
	});
}

// 数字カウンター ::::::::::::::::::::::::::::::::::::::
function initCounter() {
	const counters = document.querySelectorAll('.js-num-count');
	if (!counters.length) return;

	const countObserver = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (!entry.isIntersecting) return;

			const el = entry.target;
			const target = Number(el.dataset.target);
			const duration = 1500;
			let start = null;

			function animate(now) {
				if (!start) start = now;

				const progress = Math.min((now - start) / duration, 1);
				el.textContent = Math.floor(progress * target).toLocaleString();

				if (progress < 1) requestAnimationFrame(animate);
			}

			requestAnimationFrame(animate);
			countObserver.unobserve(el);
		});
	}, { threshold: 0.5 });

	counters.forEach(el => countObserver.observe(el));
}

// CTAビデオスクロール到達したら発火 ::::::::::::::::::::::::::::::::::::::
function initCtaVideo() {
	const ctaVideo = document.querySelector('.js-cta-video');
	if (!ctaVideo) return;

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (prefersReducedMotion) return;

	let isInView = false;
	let isLoaded = false; // ← 追加

	const playVideo = () => {
		if (document.hidden) return;

		// 未ロードなら source をセットして load() してから play
		if (!isLoaded) {
			const source = ctaVideo.querySelector('source');
			source.src = source.dataset.src; // ← data-src から src にセット
			ctaVideo.load();
			isLoaded = true;
		}

		ctaVideo.play().catch(() => { });
	};

	const ctaObserver = new IntersectionObserver(([entry]) => {
		isInView = entry.isIntersecting;
		if (isInView) {
			playVideo();
		} else {
			ctaVideo.pause();
		}
	}, { threshold: 0.4 });

	ctaObserver.observe(ctaVideo);

	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			ctaVideo.pause();
		} else if (isInView) {
			playVideo();
		}
	});
}


// フロートCTAボタン ::::::::::::::::::::::::::::::::::::::
function initFloatCta() {
	const floatCta = document.getElementById('floatCta');
	const hero = document.querySelector('.hero');
	const mainCta = document.querySelector('.main-cta');
	if (!floatCta || !hero) return;

	// heroを抜けたら表示、main-ctaに入ったら非表示
	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.target === hero) {
				const past = !entry.isIntersecting;
				floatCta.classList.toggle('is-visible', past);
				floatCta.setAttribute('aria-hidden', String(!past));
			}
			if (entry.target === mainCta) {
				floatCta.classList.toggle('is-hidden', entry.isIntersecting);
			}
		});
	}, { threshold: 0.2 });

	observer.observe(hero);
	if (mainCta) observer.observe(mainCta);
}
