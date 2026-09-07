const ipInputs = document.querySelectorAll(".octet");
const cidrInput = document.getElementById("cidr");
const deviceCountInput = document.getElementById("deviceCount");
const results = document.getElementById("results");
const calculateButton = document.getElementById("calculateButton");

calculateButton.addEventListener("click", calculateHomeSubnet);

document.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    calculateHomeSubnet();
  }
});

function calculateHomeSubnet() {
  clearResults();

  const ip = [...ipInputs].map(input => Number(input.value));
  const cidrText = cidrInput.value.trim();
  const deviceCountText = deviceCountInput.value.trim();

  if (ip.some(value => !isValidOctet(value))) {
    showError("Invalid IPv4 address.");
    return;
  }

  if (cidrText === "") {
    showError("Enter a CIDR value from 0 to 32.");
    return;
  }

  if (deviceCountText === "") {
    showError("Enter the number of devices.");
    return;
  }

  const cidr = Number(cidrText);
  const deviceCount = Number(deviceCountText);

  if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) {
    showError("Invalid CIDR. Enter a value from 0 to 32.");
    return;
  }

  if (!Number.isInteger(deviceCount) || deviceCount < 1) {
    showError("The number of devices must be a positive whole number.");
    return;
  }

  const inputIP = ipToInteger(ip);
  const originalNetwork = inputIP & cidrToMask(cidr);
  const originalAddressCount = 2 ** (32 - cidr);
  const requiredAddressCount = deviceCount + 2;
  const hostBits = Math.ceil(Math.log2(requiredAddressCount));
  const newCIDR = 32 - hostBits;

  if (newCIDR < cidr) {
    showError(`The network /${cidr} cannot contain ${deviceCount} devices.`);
    return;
  }

  const addressesPerNetwork = 2 ** hostBits;
  const newMask = cidrToMask(newCIDR);
  const network = inputIP & newMask;
  const broadcast = network + addressesPerNetwork - 1;
  const gateway = network + 1;
  const firstUsable = gateway;
  const lastUsable = broadcast - 1;
  const availableDeviceIPs = lastUsable - firstUsable + 1;

  if (addressesPerNetwork > originalAddressCount || broadcast > 0xffffffff) {
    showError(`The network /${cidr} cannot contain ${deviceCount} devices.`);
    return;
  }

  let output = "";
  output += `Input Network: ${integerToIP(originalNetwork)}/${cidr}\n`;
  output += `Devices requested: ${deviceCount}\n\n`;
  output += `New Network: ${integerToIP(network)}/${newCIDR}\n`;
  output += `New Subnet Mask: ${integerToIP(newMask)}\n\n`;
  output += `Default Gateway: ${integerToIP(gateway)}\n`;
  output += `Network Address: ${integerToIP(network)}\n`;
  output += `First IP: ${integerToIP(firstUsable)}\n`;
  output += `Last IP: ${integerToIP(lastUsable)}\n`;
  output += `Broadcast Address: ${integerToIP(broadcast)}\n`;
  output += `Usable IPs: ${availableDeviceIPs}`;

  results.textContent = output.trim();
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
