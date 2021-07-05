class Transaction {
  transactionId = "";
  timestamp = Date.now();
  #feePercent = 0.6;

  constructor(sender, recipient, funds = 0.0, description = "Generic") {
    this.sender = sender;
    this.recipient = recipient;
    this.funds = funds;
    this.description = description;
    this.transactionId = this.calculateHash();
  }

  displayTransaction() {
    return `Transaction ${this.description} from ${this.sender} to ${this.recipient} for ${this.funds}`;
  }

  get netTotal() {
    return Transaction.#precisionRound(this.funds * this.#feePercent, 2);
  }

  static #precisionRound(number, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
}

const DEFAULT_ALGO_SHA256 = "SHA256"; // HasHash
const DEFAULT_ENCODING_HEX = "hex"; // HasHash

const DEFAULT_SIGN_ALGO = "RSA-SHA256";

const HasHash = (
  keys,
  options = { algorithm: DEFAULT_ALGO_SHA256, encoding: DEFAULT_ENCODING_HEX }
) => ({
  calculateHash() {
    const data = keys.map((f) => this[f]).join("");
    let hash = 0,
      i = 0;

    while (i < data.length) {
      hash = ((hash << 5) - hash + data.charCodeAt(i++)) << 0;
    }
    return hash ** 2;
  },
});

const HasSignature = (
  keys,
  options = {
    algorithm: DEFAULT_SIGN_ALGO,
    encoding: DEFAULT_ENCODING_HEX,
  }
) => ({
  generateSignature(privateKey) {},

  verifySignature(publicKey, signature) {},
});

const HasValidation = () => ({});

class BlockChain {
  #blocks = new Map();

  constructor(genesis = createGenesisBlock()) {
    this.#blocks.set(genesis.hash, genesis);
  }

  height() {
    return this.#blocks.size;
  }

  lookup(hash) {
    const h = hash;
    if (this.#blocks.has(h)) {
      return this.#blocks.get(h);
    }
    throw new Error(`Block with hash ${h} not found!`);
  }

  push(newBlock) {
    this.#blocks.set(newBlock.hash, newBlock);
    return newBlock;
  }
}

class Block {
  #blockchain;

  constructor(index, previousHash, data = []) {
    this.index = index;
    this.data = data;
    this.previousHash = previousHash;
    this.timestamp = Date.now();
    this.hash = this.calculateHash();
  }

  set blockchain(b) {
    this.#blockchain = b;
    return this;
  }

  isGenesis() {
    return this.previousHash === "0".repeat(64);
  }
}

class Wallet {
  constructor(publicKey, privateKey) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  get address() {
    return this.publicKey;
  }

  balance(ledger) {}
}

function createGenesisBlock(previousHash = "0".repeat(64)) {}

Object.assign(BlockChain.prototype, HasValidation());
Object.assign(
  Block.prototype,
  HasHash(["index", "timestamp", "previousHash", "data"]),
  HasValidation()
);

Object.assign(
  Transaction.prototype,
  HasHash(["timestamp", "sender", "recipient", "funds"]),
  HasSignature(["sender", "recipient", "funds"]),
  HasValidation()
);

const tx = new Transaction("luid@tjoj.com", "luke@tjoj.com", 10);
