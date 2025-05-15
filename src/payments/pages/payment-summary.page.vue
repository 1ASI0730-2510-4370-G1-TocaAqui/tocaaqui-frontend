<script>
import PaymentList from '../components/payment-list.component.vue';

export default {
    name: 'PaymentSummary',
    components: {
        PaymentList
    },
    data() {
        return {
            userId: null
        };
    },
    created() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            this.userId = Number(user.id);
        }
    }
};
</script>


<template>
    <div class="payment-summary">
        <div class="grid">
            <div class="col-12">             
                <PaymentList :user-id="userId" ref="paymentList" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.payment-summary {
    padding: 1rem;
}

h2 {
    color: var(--text-color);
    margin-bottom: 1rem;
}
</style> 