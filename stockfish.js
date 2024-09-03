let wasmSupported = (typeof WebAssembly === "object");

if (wasmSupported) {
    fetch('stockfish.wasm')
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.instantiate(bytes, { }))
        .then(results => {
            stockfish = results.instance.exports;
            onRuntimeInitialized();
        });
} else {
    console.error("WebAssembly is not supported in this browser.");
}

let onRuntimeInitialized = function() {
    // Inizializza Stockfish
    console.log("Stockfish WASM initialized.");
};

self.onmessage = function(event) {
    if (stockfish) {
        // Invia i comandi a Stockfish
        stockfish.event.data(event.data);
    }
};
