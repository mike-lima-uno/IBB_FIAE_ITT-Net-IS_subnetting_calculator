const ipInputs = document.querySelectorAll(".octet");
const cidrInput = document.getElementById("cidr");
const subnetCountInput = document.getElementById("subnetCount");
const results = document.getElementById("results");
const calculateButton = document.getElementById("calculateButton");

calculateButton.addEventListener("click", calculateSubnets);

document.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    calculateSubnets();
  }
});

function calculateSubnets() {
  clearResults();

  const ip = [...ipInputs].map(input => Number(input.value));
  const cidrText = cidrInput.value.trim();
  const subnetCountText = subnetCountInput.value.trim();

  if (ip.some(value => !isValidOctet(value))) {
    showError("Invalid IPv4 address.");
    return;
  }

  if (cidrText === "") {
    showError("Enter a CIDR value from 0 to 32.");
    return;
  }

  if (subnetCountText === "") {
    showError("Enter the number of subnets.");
    return;
  }

  const cidr = Number(cidrText);
  const subnetCount = Number(subnetCountText);

  if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) {
    showError("Invalid CIDR. Enter a value from 0 to 32.");
    return;
  }

  if (!Number.isInteger(subnetCount) || subnetCount < 1) {
    showError("The number of subnets must be a positive whole number.");
    return;
  }

  if (!isPowerOfTwo(subnetCount)) {
    showError(
      "Invalid number of subnets. Use 1, 2, 4, 8, 16, 32, etc."
    );
    return;
  }

  const extraBits = Math.log2(subnetCount);
  const newCIDR = cidr + extraBits;

  if (newCIDR > 32) {
    showError(`Cannot divide /${cidr} into ${subnetCount} subnets.`);
    return;
  }

  const inputIP = ipToInteger(ip);
  const originalMask = cidrToMask(cidr);
  const originalNetwork = inputIP & originalMask;
  const subnetMask = cidrToMask(newCIDR);
  const addressesPerSubnet = 2 ** (32 - newCIDR);
  let output = "";

  output += `Original Network: ${integerToIP(originalNetwork)}/${cidr}\n`;
  output += `Number of Subnets: ${subnetCount}\n`;
  output += `New CIDR: /${newCIDR}\n`;
  output += `Subnet Mask: ${integerToIP(subnetMask)}\n`;
  output += `Addresses per Subnet: ${addressesPerSubnet}\n\n`;

  for (let index = 0; index < subnetCount; index++) {
    const networkID = originalNetwork + index * addressesPerSubnet;
    const broadcast = networkID + addressesPerSubnet - 1;
    const firstValid = addressesPerSubnet > 2 ? networkID + 1 : networkID;
    const lastValid = addressesPerSubnet > 2 ? broadcast - 1 : broadcast;
    const usableHosts = addressesPerSubnet > 2
      ? addressesPerSubnet - 2
      : addressesPerSubnet;

    output += `Subnet ${index + 1}: ${integerToIP(networkID)}/${newCIDR}\n`;
    output += `\tNetwork ID: ${integerToIP(networkID)}\n`;
    output += `\tBroadcast: ${integerToIP(broadcast)}\n`;
    output += `\tFirst Valid IP: ${integerToIP(firstValid)}\n`;
    output += `\tLast Valid IP: ${integerToIP(lastValid)}\n`;
    output += `\n\tTotal / Usable Addresses: ${addressesPerSubnet} / ${usableHosts}\n\n`;
  }

  results.textContent = output.trim();
}

function isPowerOfTwo(value) {
  return value > 0 && (value & (value - 1)) === 0;
}

function isValidOctet(value) {
  return Number.isInteger(value) && value >= 0 && value <= 255;
}

function ipToInteger(ip) {
  return (
    ((ip[0] << 24) |
    (ip[1] << 16) |
    (ip[2] << 8) |
    ip[3]) >>> 0
  );
}

function integerToIP(value) {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255
  ].join(".");
}

function cidrToMask(cidr) {
  if (cidr === 0) {
    return 0;
  }

  return (0xffffffff << (32 - cidr)) >>> 0;
}

function clearResults() {
  results.classList.remove("text-red-600");
  results.textContent = "";
}

function showError(message) {
  results.classList.add("text-red-600");
  results.textContent = message;
}
