<template>
  <!-- Grant details -->
  <div v-if="!isEditing && grant">
    <h1 class="my-6 text-center text-3xl font-extrabold text-gray-900">Grant Details</h1>
    <p>Name: {{ grantMetadata?.name }}</p>
    <p>Description: {{ grantMetadata?.description }}</p>
    <p>Owner: {{ grant.owner }}</p>
    <p>Payee: {{ grant.payee }}</p>
    <div class="flex justify-center">
      <button v-if="isInCart(grant.id)" @click="removeFromCart(grant?.id)" class="mt-5 btn btn-primary">
        Remove from Cart
      </button>
      <button v-else @click="addToCart(grant?.id)" class="mt-5 btn btn-primary">Add to Cart</button>
      <button v-if="isOwner" @click="enableEdit()" class="mt-5 btn btn-secondary">Edit Grant</button>
    </div>
  </div>

  <!-- Editing grant -->
  <div v-else-if="grant" class="flex flex-col justify-center sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img
        class="mx-auto h-12 w-auto"
        src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
        alt="Workflow"
      />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Edit Grant {{ grantMetadata?.name }}</h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md text-left">
      <div class="py-8 px-4 border border-gray-200 shadow sm:rounded-lg sm:px-6 bg-gray-50">
        <form class="space-y-6" @submit.prevent="saveEdits">
          <!-- Owner address -->
          <BaseInput
            v-model="form.owner"
            description="The owner has permission to edit the grant"
            id="owner-address"
            label="Owner address"
            :rules="isValidAddress"
            errorMsg="Please enter a valid address"
          />

          <!-- Payee address -->
          <BaseInput
            v-model="form.payee"
            description="The address contributions and matching funds are sent to"
            id="payee-address"
            label="Payee address"
            :rules="isValidAddress"
            errorMsg="Please enter a valid address"
          />

          <!-- Grant name -->
          <BaseInput
            v-model="form.name"
            description="Your grant's name"
            id="grant-name"
            label="Grant name"
            :rules="isDefined"
            errorMsg="Please enter a name"
          />

          <!-- Grant Description -->
          <BaseInput
            v-model="form.description"
            description="Your grant's description"
            id="grant-description"
            label="Grant description"
            :rules="isDefined"
            errorMsg="Please enter a description"
          />

          <!-- Submit and cancel buttons -->
          <button
            type="submit"
            class="btn btn-primary w-full"
            :class="{ 'btn-primary-disabled': !isFormValid }"
            :disabled="!isFormValid"
          >
            Save Edits
          </button>
          <button @click.prevent="cancelEdits" class="btn btn-outline w-full">Cancel</button>
        </form>
      </div>
    </div>
  </div>

  <!-- No grant selected -->
  <div v-else>
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">No grant selected</h2>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import BaseInput from 'src/components/BaseInput.vue';
// --- Store ---
import useCartStore from 'src/store/cart';
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';
// --- Methods and Data ---
import { GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI } from 'src/utils/constants';
import { Contract, ContractTransaction } from 'src/utils/ethers';
import { isValidAddress, isValidUrl, isDefined } from 'src/utils/utils';
// --- Types ---
import { GrantRegistry } from '@dgrants/contracts';
import * as ipfs from 'src/utils/ipfs';

function useGrantDetail() {
  const { grants, poll, grantMetadata: metadata } = useDataStore();
  const { signer, userAddress } = useWalletStore();

  const route = useRoute();
  const grant = computed(() => {
    const id = route.params.id; // type `string | string[]`, so must narrow it down
    if (!grants.value || Array.isArray(id)) return null; // array type unsupported
    return grants.value[Number(id)];
  });
  const grantMetadata = computed(() => (grant.value ? metadata.value[grant.value.metaPtr] : null));

  // --- Edit capabilities ---
  const isOwner = computed(() => userAddress.value === grant.value?.owner);
  const isEditing = ref(false);

  const form = ref<{ owner: string; payee: string; name: string; description: string }>({
    owner: grant.value?.owner || '',
    payee: grant.value?.payee || '',
    name: grantMetadata.value?.name || '',
    description: grantMetadata.value?.description || '',
  });

  const isFormValid = computed(() => {
    if (!grant.value) return false;
    const { owner, payee, name, description } = form.value;
    const areFieldsValid = isValidAddress(owner) && isValidAddress(payee) && isDefined(name) && isDefined(description);

    const areFieldsUpdated =
      owner !== grant.value.owner ||
      payee !== grant.value.payee ||
      name !== grantMetadata.value?.name ||
      description !== grantMetadata.value?.description;

    return areFieldsValid && areFieldsUpdated;
  });

  /**
   * @notice Resets the form values that user may have changed, and hides the edit window
   */
  function cancelEdits() {
    prefillEditForm();

    // Hide edit form
    isEditing.value = false;
  }

  /**
   * @notice Saves edits
   */
  async function saveEdits() {
    // Validation
    const { owner, payee, name, description } = form.value;
    if (!grant.value) throw new Error('No grant selected');
    if (!signer.value) throw new Error('Please connect a wallet');

    // Get registry instance
    const registry = <GrantRegistry>new Contract(GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI, signer.value);

    // Determine which update method to call
    let tx: ContractTransaction;
    const g = grant.value; // for better readability in the if statements
    let metaPtr = g.metaPtr;

    const gMetadata = grantMetadata.value;
    const isMetaPtrUpdated = name !== gMetadata?.name || description !== gMetadata?.description;
    if (isMetaPtrUpdated) {
      metaPtr = await ipfs
        .uploadGrantMetadata({ name, description })
        .then((cid) => ipfs.getMetaPtr({ cid: cid.toString() }));
    }

    if (owner !== g.owner && payee === g.payee && !isMetaPtrUpdated) {
      // update Grant Owner
      tx = await registry.updateGrantOwner(g.id, owner);
    } else if (owner === g.owner && payee !== g.payee && !isMetaPtrUpdated) {
      // update Grant Payee
      tx = await registry.updateGrantPayee(g.id, payee);
    } else if (owner === g.owner && payee === g.payee && isMetaPtrUpdated) {
      // update Grant MetaPtr
      tx = await registry.updateGrantMetaPtr(g.id, metaPtr);
    } else {
      // update all
      tx = await registry.updateGrant(g.id, owner, payee, metaPtr);
    }

    // After tx mines, poll so the store has the latest data, then navigate to the grant page
    await tx.wait();
    await poll();
    cancelEdits(); // reset form ref and toggle page state back to display mode
  }

  /**
   * @notice Loads the default values into edit form, and shows the edit window
   */
  function enableEdit() {
    prefillEditForm();

    // Enable edit form
    isEditing.value = true;
  }

  /**
   * @notice util function which prefills edit form
   */
  function prefillEditForm() {
    form.value.owner = grant.value?.owner || '';
    form.value.payee = grant.value?.payee || '';
    form.value.name = grantMetadata.value?.name || '';
    form.value.description = grantMetadata.value?.description || '';
  }

  return {
    isEditing,
    isOwner,
    isValidAddress,
    isValidUrl,
    isDefined,
    isFormValid,
    grant,
    grantMetadata,
    form,
    cancelEdits,
    saveEdits,
    enableEdit,
  };
}

export default defineComponent({
  name: 'GrantRegistryGrantDetail',
  components: { BaseInput },
  setup() {
    const { addToCart, isInCart, removeFromCart } = useCartStore();
    return { isInCart, addToCart, removeFromCart, ...useGrantDetail() };
  },
});
</script>
