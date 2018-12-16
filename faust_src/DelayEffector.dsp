import("stdfaust.lib");

DelayG(x) = hgroup("Delay", x);
OtherG(x) = hgroup("SubEffector", x);

// control params
params = environment {
	delayTimeMsec = DelayG(hslider("Delay Time (msec)[style:knob]", 100, 1, 1000, 1));
	feedbackGain = DelayG(hslider("Delay Feedback[style:knob]", 0.5, 0.0, 1.0, 0.01));
	cutoff = OtherG(hslider("Cutoff Frequency (Hz)[style:knob]", 5000, 40, 15000, 1));
	driveGain = OtherG(hslider("Drive[style:knob]", 5.0, 1.0, 20.0, 0.01));
    wetness = DelayG(hslider("Wet[style:knob]", 0.5, 0.0, 1.0, 0.01));
};

// with liner interpolation
delay(u) = @(u, int(tau) + 1) * c, @(u, int(tau)) * (1.0 - c) : +
    with {
        tau = (params.delayTimeMsec * 10^(-3)) * ma.SR; // delay block length
        c = ma.frac(tau);
    };

// simple RC lowpass filter
lowpassFilter(u) = b0*u + b1*@(u, 1) : - ~*(a1)
    with {
        w = 2.0*ma.PI*params.cutoff;
        // filter coefficients
        b0 = w / (w + 2.0*ma.SR);
        b1 = b0;
        a1 = (w - 2.0*ma.SR) / (w + 2.0*ma.SR);
    };

distortion(u) = atan(g*u) / (0.5*ma.PI)
    with {
        g = params.driveGain;
    };

mixer(drySig, wetSig) = (1.0 - k) * drySig, k * wetSig : +
    with {
        k = params.wetness;
    };


feedbackDelay(u) = delay~(distortion : lowpassFilter : *(g), u : +)
    with {
        g = params.feedbackGain;
    };

monoProcess =  _ <: _, feedbackDelay : mixer;

// main process
process = monoProcess, monoProcess;
