const NotificationSystem = {
	_activeToast: null,
	_activeTimer: null,
	_activeAnimTimer: null,

	/**
	 * Show a toast notification (single-toast rule: replaces any existing toast)
	 * @param {string} message - The message to display
	 * @param {'success' | 'error' | 'info'} type - The type of notification
	 * @param {number} duration - How long to show the notification (ms)
	 * @param {string} [key] - A unique key to identify this toast for selective clearing
	 */
	showToast(message, type = 'info', duration = 3000, key = null) {
		const validTypes = ['success', 'error', 'info'];
		const toastType = validTypes.includes(type) ? type : 'info';
		this._showCustomToast(message, toastType, duration, key);
	},

	/**
	 * @private
	 */
	_showCustomToast(message, type, duration, key) {
		this._injectStyles();
		this._dismissCurrent();

		const containerId = 'scrum-helper-toast-container';
		let container = document.getElementById(containerId);

		if (!container) {
			container = document.createElement('div');
			container.id = containerId;
			container.style.cssText = `
				position: fixed;
				top: 10px;
				left: 50%;
				transform: translateX(-50%);
				z-index: 10000;
				display: flex;
				flex-direction: column;
				gap: 8px;
				pointer-events: none;
				width: 90%;
				max-width: 320px;
			`;
			if (document.body) {
				document.body.appendChild(container);
			} else {
				document.documentElement.appendChild(container);
			}
		}

		const toast = document.createElement('div');
		toast.className = `scrum-toast scrum-toast-${type}`;
		if (key) {
			toast.setAttribute('data-scrum-toast-key', key);
		}

		if (type === 'error') {
			toast.setAttribute('role', 'alert');
			toast.setAttribute('aria-live', 'assertive');
		} else {
			toast.setAttribute('role', 'status');
			toast.setAttribute('aria-live', 'polite');
		}
		toast.setAttribute('aria-atomic', 'true');

		let bg = '#3b82f6';
		let icon = 'fa-info-circle';

		if (type === 'error') {
			bg = '#dc2626';
			icon = 'fa-exclamation-circle';
		} else if (type === 'success') {
			bg = '#10b981';
			icon = 'fa-check-circle';
		}

		toast.style.cssText = `
			background: ${bg};
			color: white;
			padding: 10px 16px;
			border-radius: 8px;
			font-weight: 600;
			font-size: 13px;
			box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
			border: 1px solid rgba(255, 255, 255, 0.2);
			display: flex;
			align-items: center;
			gap: 10px;
			pointer-events: auto;
			animation: toast-in 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
			width: 100%;
			max-width: 320px;
			margin: 0 auto;
		`;

		const iconEl = document.createElement('i');
		iconEl.className = `fa ${icon}`;

		const textEl = document.createElement('span');
		textEl.textContent = message;

		toast.appendChild(iconEl);
		toast.appendChild(textEl);

		container.appendChild(toast);
		this._activeToast = toast;

		this._activeTimer = setTimeout(() => {
			toast.style.animation = 'toast-out 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045)';
			toast.style.opacity = '0';
			this._activeAnimTimer = setTimeout(() => {
				if (toast.parentNode) {
					toast.parentNode.removeChild(toast);
				}
				if (container.children.length === 0 && container.parentNode) {
					container.parentNode.removeChild(container);
				}
				if (this._activeToast === toast) {
					this._activeToast = null;
				}
			}, 300);
		}, duration);
	},

	/**
	 * @private
	 */
	_dismissCurrent() {
		if (this._activeTimer) {
			clearTimeout(this._activeTimer);
			this._activeTimer = null;
		}
		if (this._activeAnimTimer) {
			clearTimeout(this._activeAnimTimer);
			this._activeAnimTimer = null;
		}
		if (this._activeToast && this._activeToast.parentNode) {
			this._activeToast.parentNode.removeChild(this._activeToast);
		}
		this._activeToast = null;

		const container = document.getElementById('scrum-helper-toast-container');
		if (container && container.children.length === 0 && container.parentNode) {
			container.parentNode.removeChild(container);
		}
	},

	/**
	 * Clear toasts from the screen
	 * @param {string} [key]
	 */
	clearToasts(key = null) {
		if (key) {
			const container = document.getElementById('scrum-helper-toast-container');
			if (!container) return;
			const safeKey = (typeof CSS !== 'undefined' && typeof CSS.escape === 'function')
				? CSS.escape(key)
				: key.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
			const toasts = container.querySelectorAll(`[data-scrum-toast-key="${safeKey}"]`);
			toasts.forEach((toast) => {
				if (this._activeToast === toast) {
					this._dismissCurrent();
				} else if (toast.parentNode) {
					toast.parentNode.removeChild(toast);
				}
			});
			if (container.children.length === 0 && container.parentNode) {
				container.parentNode.removeChild(container);
			}
		} else {
			this._dismissCurrent();
			const container = document.getElementById('scrum-helper-toast-container');
			if (container) {
				container.innerHTML = '';
				if (container.parentNode) {
					container.parentNode.removeChild(container);
				}
			}
		}
	},

	/**
	 * @private
	 */
	_injectStyles() {
		if (document.getElementById('scrum-helper-toast-styles')) return;

		const style = document.createElement('style');
		style.id = 'scrum-helper-toast-styles';
		style.textContent = `
			@keyframes toast-in {
				from { opacity: 0; transform: translateY(-20px) scale(0.9); }
				to { opacity: 1; transform: translateY(0) scale(1); }
			}
			@keyframes toast-out {
				from { opacity: 1; transform: translateY(0) scale(1); }
				to { opacity: 0; transform: scale(0.95); }
			}
		`;
		(document.head || document.documentElement).appendChild(style);
	}
};

if (typeof module !== 'undefined' && module.exports) {
	module.exports = NotificationSystem;
}
