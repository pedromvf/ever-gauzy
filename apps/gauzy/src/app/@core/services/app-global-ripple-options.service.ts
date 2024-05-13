import { Injectable } from '@angular/core';
import { RippleGlobalOptions } from '@angular/material/core';

@Injectable({
	providedIn: 'root'
})
export class AppGlobalRippleOptions implements RippleGlobalOptions {
	/** Whether ripples should be disabled globally. */
	public disabled: boolean = false;

	/**
	 * Toggles the Ripple effect.
	 * @param enabled Whether to enable or disable the Ripple effect.
	 */
	public toggle(enabled: boolean): void {
		// Alerting for demonstration purposes only; you may replace it with your actual logic
		alert(enabled);

		// Toggles the disabled state based on the provided value
		this.disabled = !enabled;
	}
}
