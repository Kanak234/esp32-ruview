/**
 * RuView Map Calibration Controller
 * Manages interactive room layout, node placement, and zone boundary setup.
 */

class RuViewMapCalibration {
    constructor() {
        this.initEvents();
    }

    initEvents() {
        const btnCalibrate = document.getElementById('btn-map-calibrate');
        const modal = document.getElementById('calibration-modal');
        const closeBtn = document.getElementById('calib-close-btn');
        const saveBtn = document.getElementById('btn-save-calibration');
        const resetBtn = document.getElementById('btn-reset-calibration');

        if (btnCalibrate) {
            btnCalibrate.addEventListener('click', () => {
                this.loadCalibrationIntoForm();
                modal.classList.add('active');
            });
        }

        if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveFormCalibration());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetDefaultCalibration());
    }

    loadCalibrationIntoForm() {
        if (!window.renderer) return;
        const config = window.renderer.calibration;

        document.getElementById('calib-room-width').value = config.roomWidthMeters || 6.0;
        document.getElementById('calib-room-height').value = config.roomHeightMeters || 4.0;
    }

    saveFormCalibration() {
        if (!window.renderer) return;

        const w = parseFloat(document.getElementById('calib-room-width').value) || 6.0;
        const h = parseFloat(document.getElementById('calib-room-height').value) || 4.0;

        const newConfig = {
            roomWidthMeters: w,
            roomHeightMeters: h,
            zones: window.renderer.calibration.zones,
            nodes: window.renderer.calibration.nodes
        };

        window.renderer.saveCalibration(newConfig);
        window.renderer.requestRender();

        const modal = document.getElementById('calibration-modal');
        if (modal) modal.classList.remove('active');

        if (window.uiController) {
            window.uiController.addTimelineEvent('Saved local map calibration parameters');
        }
    }

    resetDefaultCalibration() {
        localStorage.removeItem('ruview_map_calibration');
        if (window.renderer) {
            window.renderer.calibration = window.renderer.loadCalibration();
            window.renderer.requestRender();
        }
        const modal = document.getElementById('calibration-modal');
        if (modal) modal.classList.remove('active');
    }
}

window.mapCalibration = new RuViewMapCalibration();
