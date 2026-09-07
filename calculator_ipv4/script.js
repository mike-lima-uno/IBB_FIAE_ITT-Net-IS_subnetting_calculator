const ipInputs = document.querySelectorAll(".octet");
const maskInputs = document.querySelectorAll(".mask-octet");
const cidrInput = document.getElementById("cidr");
const results = document.getElementById("results");

let lastEdited = null;

cidrInput.addEventListener("input", () => {
  lastEdited = "cidr";
});

maskInputs.forEach(input => {
  input.addEventListener("input", () => {
    lastEdited = "mask";
  });
});

document
  .getElementById("calculateButton")
  .addEventListener("click", calculateSubnet);

document.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    calculateSubnet();
  }
});

function calculateSubnet() {
  clearResults();

  const ip = [...ipInputs].map(input => Number(input.value));
  const maskText = [...maskInputs].map(input => input.value.trim());
  const cidrText = cidrInput.value.trim();

  if (ip.some(value => !isValidOctet(value))) {
    showError("Invalid IPv4 address.");
    return;
  }

  const allMasksFilled = maskText.every(value => value !== "");
  const hasCIDR = cidrText !== "";

  if (lastEdited === "cidr" || (hasCIDR && !allMasksFilled)) {
    const cidr = Number(cidrText);

    if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) {
      showError("Invalid CIDR. Enter a value from 0 to 32.");
      return;
    }

    const mask = cidrToMask(cidr);
    setMaskValues(mask);
    displayResults(ip, mask, cidr);
    return;
  }

  if (allMasksFilled) {
    const mask = maskText.map(Number);

    if (mask.some(value => !isValidOctet(value))) {
      showError("Invalid subnet mask.");
      return;
    }

    const cidr = maskToCIDR(mask);

    if (cidr === null) {
      showError(
        "Invalid subnet mask. The mask must contain consecutive 1-bits."
      );
      return;
    }

    cidrInput.value = cidr;
    displayResults(ip, mask, cidr);
    return;
  }

  showError("Enter a CIDR value or complete all subnet-mask fields.");
}

function cidrToMask(cidr) {
  const mask = [];

  for (let i = 0; i < 4; i++) {
    const bitsLeft = cidr - i * 8;

    if (bitsLeft >= 8) {
      mask.push(255);
    } else if (bitsLeft <= 0) {
      mask.push(0);
    } else {
      mask.push(256 - 2 ** (8 - bitsLeft));
    }
  }

  return mask;
}

function maskToCIDR(mask) {
  const binary = mask
    .map(value => value.toString(2).padStart(8, "0"))
    .join("");

  if (!/^1*0*$/.test(binary)) {
    return null;
  }

  return binary.indexOf("0") === -1
    ? 32
    : binary.indexOf("0");
}

function setMaskValues(mask) {
  maskInputs.forEach((input, index) => {
    input.value = mask[index];
  });
}

function displayResults(ip, mask, cidr) {
  const network = ip.map((value, index) => {
    return value & mask[index];
  });

  const broadcast = network.map((value, index) => {
    return value | (255 - mask[index]);
  });

  const totalAddresses = 2 ** (32 - cidr);
  const firstValid = totalAddresses > 2 ? addOne(network) : network;
  const lastValid = totalAddresses > 2 ? subtractOne(broadcast) : broadcast;
  const hostBits = 32 - cidr;
  const usableHosts = totalAddresses > 2 ? totalAddresses - 2 : totalAddresses;
  const firstValidHtml = formatComparedAddress(firstValid, lastValid);
  const lastValidHtml = formatComparedAddress(lastValid, firstValid);

  results.classList.remove("text-red-600");
  results.innerHTML =
`Subnet Mask:       ${mask.join(".")}
CIDR:              /${cidr}
Host Bits:         ${hostBits}

Network Address:   ${network.join(".")}
\tFirst Valid IP:  ${firstValidHtml}
\tLast Valid IP:   ${lastValidHtml}
Broadcast Address: ${broadcast.join(".")}

Total Addresses:   ${totalAddresses}
Usable Hosts:      ${usableHosts}`;
}

function addOne(address) {
  return address.slice().map((value, index, array) => {
    if (index === array.length - 1) {
      return value + 1;
    }

    return value;
  });
}

function subtractOne(address) {
  return address.slice().map((value, index, array) => {
    if (index === array.length - 1) {
      return value - 1;
    }

    return value;
  });
}

function formatComparedAddress(address, comparison) {
  return address
    .map((octet, index) => {
      const color = octet === comparison[index]
        ? "text-gray-400"
        : "text-black";

      return `<span class="${color}">${octet}</span>`;
    })
    .join(".");
}

function isValidOctet(value) {
  return Number.isInteger(value) && value >= 0 && value <= 255;
}

function clearResults() {
  results.classList.remove("text-red-600");
  results.textContent = "";
}

function showError(message) {
  results.classList.add("text-red-600");
  results.textContent = message;
}
