const ipv6Inputs = document.querySelectorAll(".ipv6-group");
const cidrInput = document.getElementById("cidr");
const subnetCountInput = document.getElementById("subnetCount");
const results = document.getElementById("results");
const calculateButton = document.getElementById("calculateButton");

const IPV6_BITS = 128n;
const IPV6_MAX = (1n << IPV6_BITS) - 1n;

calculateButton.addEventListener("click", calculateSubnets);

document.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    calculateSubnets();
  }
});

ipv6Inputs.forEach(input => {
  input.addEventListener("blur", () => {
    if (input.value.trim() === "") {
      input.value = "0";
    }
  });

  input.addEventListener("input", () => {
    input.value = input.value
      .replace(/[^0-9a-fA-F]/g, "")
      .slice(0, 4)
      .toUpperCase();
  });
});

function calculateSubnets() {
  clearResults();
  completeEmptyGroups();

  const groups = [...ipv6Inputs].map(input => input.value.trim());
  const cidrText = cidrInput.value.trim();
  const subnetCountText = subnetCountInput.value.trim();

  if (groups.some(group => !isValidIPv6Group(group))) {
    showError("Invalid IPv6 address group.");
    return;
  }

  if (cidrText === "") {
    showError("Enter a CIDR prefix from 0 to 128.");
    return;
  }

  if (subnetCountText === "") {
    showError("Enter the number of subnets.");
    return;
  }

  const cidr = Number(cidrText);
  const subnetCount = Number(subnetCountText);

  if (!Number.isInteger(cidr) || cidr < 0 || cidr > 128) {
    showError("Invalid CIDR. Enter a value from 0 to 128.");
    return;
  }

  if (!Number.isInteger(subnetCount) || subnetCount < 1) {
    showError("The number of subnets must be a positive whole number.");
    return;
  }

  if (!isPowerOfTwo(subnetCount)) {
    showError("Invalid number of subnets. Use 1, 2, 4, 8, 16, etc.");
    return;
  }

  const additionalBits = Math.log2(subnetCount);
  const newCIDR = cidr + additionalBits;

  if (newCIDR > 128) {
    showError(`Cannot divide /${cidr} into ${subnetCount} subnets.`);
    return;
  }

  const inputAddress = groupsToBigInt(groups);
  const originalMask = cidrToMask(cidr);
  const originalNetwork = inputAddress & originalMask;
  const subnetMask = cidrToMask(newCIDR);
  const addressesPerSubnet = 1n << BigInt(128 - newCIDR);
  let output = "";

  output += `Original Network: ${formatIPv6(originalNetwork)}/${cidr}\n`;
  output += `Number of Subnets: ${subnetCount}\n`;
  output += `New CIDR: /${newCIDR}\n`;
  output += `Subnet Mask: ${formatIPv6(subnetMask)}\n`;
  output += `Addresses per Subnet: ${addressesPerSubnet}\n\n`;

  for (let index = 0; index < subnetCount; index++) {
    const subnetNumber = BigInt(index);
    const networkID = originalNetwork + subnetNumber * addressesPerSubnet;
    const lastAddress = networkID + addressesPerSubnet - 1n;
    const firstValid = addressesPerSubnet > 2n ? networkID + 1n : networkID;
    const lastValid = addressesPerSubnet > 2n ? lastAddress - 1n : lastAddress;
    const usableHosts = addressesPerSubnet > 2n
      ? addressesPerSubnet - 2n
      : addressesPerSubnet;

    output += `Subnet ${index + 1}: ${formatIPv6(networkID)}/${newCIDR}\n`;
    output += `\tNetwork ID: ${formatIPv6(networkID)}\n`;
    output += `\tFirst Valid IP: ${formatIPv6(firstValid)}\n`;
    output += `\tLast Valid IP: ${formatIPv6(lastValid)}\n`;
    output += `\tLast Address: ${formatIPv6(lastAddress)}\n`;
    output += `\tTotal Addresses: ${addressesPerSubnet}\n`;
    output += `\tUsable Hosts: ${usableHosts}\n\n`;
  }

  results.textContent = output.trim();
}

function completeEmptyGroups() {
  ipv6Inputs.forEach(input => {
    if (input.value.trim() === "") {
      input.value = "0";
    }
  });
}

function isValidIPv6Group(group) {
  return /^[0-9a-fA-F]{1,4}$/.test(group);
}

function isPowerOfTwo(value) {
  return value > 0 && (value & (value - 1)) === 0;
}

function groupsToBigInt(groups) {
  let value = 0n;

  for (const group of groups) {
    value = (value << 16n) | BigInt(parseInt(group, 16));
  }

  return value;
}

function cidrToMask(cidr) {
  if (cidr === 0) {
    return 0n;
  }

  return IPV6_MAX ^ ((1n << BigInt(128 - cidr)) - 1n);
}

function bigIntToGroups(value) {
  const groups = [];

  for (let index = 0; index < 8; index++) {
    const shift = BigInt((7 - index) * 16);
    const group = (value >> shift) & 0xffffn;

    groups.push(group.toString(16).padStart(4, "0"));
  }

  return groups;
}

function formatIPv6(value) {
  const groups = bigIntToGroups(value);
  let bestStart = -1;
  let bestLength = 0;
  let currentStart = -1;
  let currentLength = 0;

  for (let index = 0; index <= groups.length; index++) {
    const isZero = index < groups.length && groups[index] === "0000";

    if (isZero) {
      if (currentStart === -1) {
        currentStart = index;
        currentLength = 1;
      } else {
        currentLength++;
      }
    } else {
      if (currentLength > bestLength) {
        bestStart = currentStart;
        bestLength = currentLength;
      }

      currentStart = -1;
      currentLength = 0;
    }
  }

  const shortened = groups.map(group => {
    return group.replace(/^0+/, "") || "0";
  });

  if (bestLength < 2) {
    return shortened.join(":");
  }

  const before = shortened.slice(0, bestStart).join(":");
  const after = shortened.slice(bestStart + bestLength).join(":");

  if (before === "" && after === "") return "::";
  if (before === "") return "::" + after;
  if (after === "") return before + "::";
  return before + "::" + after;
}

function clearResults() {
  results.classList.remove("text-red-600");
  results.textContent = "";
}

function showError(message) {
  results.classList.add("text-red-600");
  results.textContent = message;
}
