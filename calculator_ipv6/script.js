const ipv6Inputs = document.querySelectorAll(".ipv6-group");
const cidrInput = document.getElementById("cidr");
const results = document.getElementById("results");

document
  .getElementById("calculateButton")
  .addEventListener("click", calculateSubnet);

document.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    completeEmptyGroups();
    calculateSubnet();
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

function completeEmptyGroups() {
  ipv6Inputs.forEach(input => {
    if (input.value.trim() === "") {
      input.value = "0";
    }
  });
}

function calculateSubnet() {
  clearResults();
  completeEmptyGroups();

  const groups = [...ipv6Inputs].map(input => input.value.trim());
  const cidrText = cidrInput.value.trim();

  if (groups.some(group => !isValidIPv6Group(group))) {
    showError("Invalid IPv6 address group.");
    return;
  }

  if (cidrText === "") {
    showError("Enter a CIDR prefix from 0 to 128.");
    return;
  }

  const cidr = Number(cidrText);

  if (!Number.isInteger(cidr) || cidr < 0 || cidr > 128) {
    showError("Invalid CIDR. Enter a value from 0 to 128.");
    return;
  }

  const address = groupsToBigInt(groups);
  const mask = cidrToMask(cidr);
  const network = address & mask;
  const lastAddress = network | (~mask & IPV6_MAX);
  const totalAddresses = 1n << BigInt(128 - cidr);
  const firstValid = totalAddresses > 2n ? network + 1n : network;
  const lastValid = totalAddresses > 2n ? lastAddress - 1n : lastAddress;
  const usableHosts = totalAddresses > 2n ? totalAddresses - 2n : totalAddresses;

  displayResults({
    address,
    cidr,
    mask,
    network,
    firstValid,
    lastValid,
    lastAddress,
    totalAddresses,
    usableHosts
  });
}

const IPV6_MAX = (1n << 128n) - 1n;

function isValidIPv6Group(group) {
  return /^[0-9a-fA-F]{1,4}$/.test(group);
}

function groupsToBigInt(groups) {
  let value = 0n;

  for (const group of groups) {
    value = (value << 16n) | BigInt(parseInt(group || "0", 16));
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

  for (let i = 0; i < 8; i++) {
    const shift = BigInt((7 - i) * 16);
    const group = Number((value >> shift) & 0xffffn);

    groups.push(group.toString(16).padStart(4, "0"));
  }

  return groups;
}

function compressIPv6(value) {
  const groups = bigIntToGroups(value);
  let bestStart = -1;
  let bestLength = 0;
  let currentStart = -1;
  let currentLength = 0;

  for (let i = 0; i <= groups.length; i++) {
    if (i < groups.length && groups[i] === "0000") {
      if (currentStart === -1) {
        currentStart = i;
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

  if (bestLength < 2) {
    return groups
      .map(group => group.replace(/^0+/, "") || "0")
      .join(":");
  }

  const before = groups
    .slice(0, bestStart)
    .map(group => group.replace(/^0+/, "") || "0")
    .join(":");

  const after = groups
    .slice(bestStart + bestLength)
    .map(group => group.replace(/^0+/, "") || "0")
    .join(":");

  if (before === "" && after === "") return "::";
  if (before === "") return "::" + after;
  if (after === "") return before + "::";
  return before + "::" + after;
}

function formatIPv6Mask(mask) {
  return compressIPv6(mask);
}

function displayResults(data) {
  results.classList.remove("text-red-600");
  results.innerHTML =
`Input Address:     ${compressIPv6(data.address)}

Subnet Mask:       ${formatIPv6Mask(data.mask)}
CIDR:              /${data.cidr}
Host Bits:         ${128 - data.cidr}

Network Address:   ${compressIPv6(data.network)}
\tFirst Valid IP:  ${compressIPv6(data.firstValid)}
\tLast Valid IP:   ${compressIPv6(data.lastValid)}
Last Address:      ${compressIPv6(data.lastAddress)}

Total Addresses:   ${data.totalAddresses.toString()}
Usable Hosts:      ${data.usableHosts.toString()}`;
}

function clearResults() {
  results.classList.remove("text-red-600");
  results.textContent = "";
}

function showError(message) {
  results.classList.add("text-red-600");
  results.textContent = message;
}
