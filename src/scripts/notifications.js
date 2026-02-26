/**
 * Notification System for Scrum Helper
 * Standardizes how toasts and alerts are shown across the extension.
 */

const NotificationSystem = {
	/**
	 * Show a toast notification
	 * @param {string} message - The message to display
	 * @param {'success' | 'error' | 'info'} type - The type of notification
	 * @param {number} duration - How long to show the notification (ms)
	 */
	showToast(message, type = 'info', duration = 3000) {
		console.log(`[Notification] ${type.toUpperCase()}: ${message}`);

		// Try to use Materialize toast if available (v1 legacy support)
		if (typeof Materialize !== 'undefined' && Materialize.toast) {
			let className = '';
			if (type === 'error') className = 'red darken-2';
			if (type === 'success') className = 'green darken-2';
			Materialize.toast(message, duration, className);
			return;
		}

		// Fallback/Custom Modern Toast (Tailwind based)
		this._showCustomToast(message, type, duration);
	},

	/**
	 * Internal method to show a custom styled toast
	 * @private
	 */
	_showCustomToast(message, type, duration) {
		const containerId = 'scrum-helper-toast-container';
		let container = document.getElementById(containerId);

		if (!container) {
			container = document.createElement('div');
			container.id = containerId;
			container.style.cssText = `
				position: fixed;
				top: 24px;
				left: 50%;
				transform: translateX(-50%);
				z-index: 10000;
				display: flex;
				flex-direction: column;
				gap: 8px;
				pointer-events: none;
			`;
			document.body.appendChild(container);
		}

		const toast = document.createElement('div');
		toast.className = `scrum-toast scrum-toast-${type}`;
		
		// Styling logic based on type
		let bg = '#3b82f6'; // info (blue)
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
			padding: 12px 20px;
			border-radius: 12px;
			font-weight: 600;
			font-size: 14px;
			box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
			display: flex;
			align-items: center;
			gap: 10px;
			pointer-events: auto;
			animation: toast-in 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
			min-width: 280px;
			max-width: 90vw;
		`;

		toast.innerHTML = `
			<i class="fa ${icon}"></i>
			<span>${message}</span>
		`;

		container.appendChild(toast);

		// Remove after duration
		setTimeout(() => {
			toast.style.animation = 'toast-out 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045)';
			toast.style.opacity = '0';
			setTimeout(() => {
				if (toast.parentNode) {
					toast.parentNode.removeChild(toast);
				}
				if (container.children.length === 0) {
					container.parentNode.removeChild(container);
				}
			}, 300);
		}, duration);
	}
};

// Add necessary animations to document
if (!document.getElementById('scrum-helper-toast-styles')) {
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
	document.head.appendChild(style);
}

// Export if in a module environment, otherwise it's global
if (typeof module !== 'undefined' && module.exports) {
	module.exports = NotificationSystem;
}
