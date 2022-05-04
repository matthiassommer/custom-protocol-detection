<template>
    <div>
        <Button @click="checkBrowser"> Test </Button>
    </div>
</template>

<script lang="ts">
import checkAndOpenUri from './protocolcheck';

export default {
    name: 'detection-example',

    methods: {
        checkBrowser(): void {
            checkAndOpenUri(
                "mailto:",
                this.failCallback,
                this.sucessCallback,
                this.unsupportedBrowser,
            );
        },
        sucessCallback(): void {
            console.warn("failed");
        },
        failCallback(): void {
            console.warn("failed");
        },
        unsupportedBrowser(): void {
            console.warn("unsupported");
        },
    }
};
</script>