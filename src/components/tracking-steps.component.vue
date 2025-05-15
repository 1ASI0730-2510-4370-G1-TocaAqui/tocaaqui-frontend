<template>
    <div class="tracking-steps">
        <div class="steps-container">
            <div v-for="(step, index) in steps" :key="index" class="step-item">
                <div class="step-icon" :class="getStepClass(index)">
                    <i :class="step.icon"></i>
                </div>
                <div class="step-label" :class="{ 'text-primary': isStepActive(index), 'text-red-500': isStepCancelled(index) }">
                    {{ step.label }}
                </div>
                <div class="step-line" :class="{ 'completed': isStepCompleted(index) }" v-if="index < steps.length - 1"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TrackingSteps',
    props: {
        currentStep: {
            type: Number,
            required: true
        },
        steps: {
            type: Array,
            required: true
        },
        isCancelled: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        isStepCompleted(index) {
            return index < this.currentStep && !this.isCancelled;
        },
        isStepActive(index) {
            return (index <= this.currentStep && !this.isCancelled) || 
                   (index === this.currentStep && this.isCancelled);
        },
        isStepCancelled(index) {
            return index === this.currentStep && this.isCancelled;
        },
        getStepClass(index) {
            return {
                'completed': this.isStepCompleted(index),
                'current': index === this.currentStep && !this.isCancelled,
                'cancelled': this.isStepCancelled(index)
            };
        }
    }
}
</script>

<style scoped>
.tracking-steps {
    padding: 1.5rem 1rem;
    width: 100%;
}

.steps-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    max-width: 800px;
    margin: 0 auto;
}

.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;
}

.step-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background-color: var(--surface-200);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 2;
    transition: all 0.3s ease;
}

.step-icon i {
    font-size: 1rem;
    color: var(--surface-600);
    transition: color 0.3s ease;
}

.step-icon.completed {
    background-color: var(--green-500);
    transform: scale(1.1);
}

.step-icon.completed i {
    color: white;
}

.step-icon.current {
    background-color: var(--primary-color);
    box-shadow: 0 0 0 4px var(--primary-100);
    transform: scale(1.2);
}

.step-icon.current i {
    color: white;
}

.step-icon.cancelled {
    background-color: var(--red-500);
    transform: scale(1.1);
}

.step-icon.cancelled i {
    color: white;
}

.step-label {
    text-align: center;
    font-size: 0.875rem;
    color: var(--surface-600);
    margin-top: 0.5rem;
    transition: color 0.3s ease;
}

.step-line {
    position: absolute;
    top: 1.25rem;
    left: calc(50% + 1.25rem);
    right: calc(-50% + 1.25rem);
    height: 2px;
    background-color: var(--surface-200);
    z-index: 1;
    transition: background-color 0.3s ease;
}

.step-line.completed {
    background-color: var(--green-500);
}

.step-item:last-child .step-line {
    display: none;
}
</style> 