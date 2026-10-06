const networkIdInput = document.getElementById("networkId");
const departmentsInput = document.getElementById("departments");
const results = document.getElementById("results");
const calculateButton = document.getElementById("calculateButton");
const classPrefixes = { A: 8, B: 16, C: 24 };
const privateNetworkIds = {
  A: "10.0.0.0/8",
  B: "172.16.0.0/16",
  C: "192.168.0.0/24"
};
const addressModeRadios = [...document.querySelectorAll('input[name="addressMode"]')];

addressModeRadios.forEach(radio => {
  radio.addEventListener("click", () => {
    if (privateNetworkIds[radio.value]) {
      networkIdInput.value = privateNetworkIds[radio.value];
    }
  });
});

networkIdInput.oninput = updateAddressModeFromInput;
calculateButton.addEventListener("click", calculateVLSM);

document.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey && event.target !== departmentsInput) {
    event.preventDefault();
    calculateVLSM();
  }
});

function calculateVLSM() {
  clearResults();

  const mode = document.querySelector('input[name="addressMode"]:checked').value;
  const networkId = networkIdInput.value.trim() || networkIdInput.placeholder;
  const network = parseNetworkInput(networkId);

  if (network === null) {
    showError("Enter a valid IPv4 network in CIDR format, for example 192.168.10.0/24.");
    return;
  }

  const startIP = network.address;
  let prefix = network.prefix;
  if (mode === "custom") {
    if (prefix === null) {
      showError("Enter a CIDR prefix for the custom network, for example 192.168.10.0/24.");
      return;
    }
  } else {
    prefix = classPrefixes[mode];
  }

  const networkSize = 2 ** (32 - prefix);
  const networkStart = Math.floor(startIP / networkSize) * networkSize;
  const networkEnd = networkStart + networkSize - 1;

  if (networkStart !== startIP) {
    showError("Subnet division was not possible.");
    return;
  }

  const departmentText = departmentsInput.value.trim() || departmentsInput.placeholder;
  const departments = parseDepartments(departmentText);
  if (departments.error) {
    showError(departments.error);
    return;
  }
  if (departments.items.length === 0) {
    showError("Describe at least one department and its required number of hosts.");
    return;
  }

  const sortedDepartments = departments.items.sort((first, second) =>
    second.hosts - first.hosts || first.order - second.order
  );
  let nextAddress = networkStart;
  const allocations = [];

  for (const department of sortedDepartments) {
    const requiredAddresses = department.hosts + 2;
    const hostBits = Math.ceil(Math.log2(requiredAddresses));
    const subnetPrefix = 32 - hostBits;
    const subnetSize = 2 ** hostBits;
    const subnetStart = Math.ceil(nextAddress / subnetSize) * subnetSize;
    const broadcast = subnetStart + subnetSize - 1;

    if (subnetPrefix < prefix || broadcast > networkEnd) {
      showError("Subnet division was not possible.");
      return;
    }

    allocations.push({
      name: department.name,
      hosts: department.hosts,
      network: subnetStart,
      prefix: subnetPrefix,
      mask: prefixToMask(subnetPrefix),
      totalAddresses: subnetSize,
      firstHost: subnetStart + 1,
      lastHost: broadcast - 1,
      broadcast,
      usableHosts: subnetSize - 2
    });
    nextAddress = broadcast + 1;
  }

  renderResults(allocations, networkStart, prefix);
}

function updateAddressModeFromInput() {
  const network = parseNetworkInput(networkIdInput.value);
  if (network === null) {
    return;
  }

  const privateClass = getPrivateClass(network.octets);
  const mode = privateClass && (network.prefix === null || network.prefix === classPrefixes[privateClass])
    ? privateClass
    : "custom";

  addressModeRadios.find(radio => radio.value === mode).checked = true;
}

function getPrivateClass(octets) {
  if (octets[0] === 10) {
    return "A";
  }
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) {
    return "B";
  }
  if (octets[0] === 192 && octets[1] === 168) {
    return "C";
  }

  return null;
}

function parseDepartments(value) {
  const items = [];
  const lines = value.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      continue;
    }

    const separatorIndex = line.lastIndexOf(":");
    const name = line.slice(0, separatorIndex).trim();
    const hostCount = line.slice(separatorIndex + 1).trim();
    if (separatorIndex < 1 || !name || !/^\d+$/.test(hostCount)) {
      return { items: [], error: `Line ${index + 1}: use the format Department: required hosts.` };
    }

    const hosts = Number(hostCount);
    if (!Number.isSafeInteger(hosts) || hosts < 1 || hosts > 4294967294) {
      return { items: [], error: `Line ${index + 1}: enter a whole number of hosts from 1 to 4294967294.` };
    }

    items.push({ name, hosts, order: index });
  }

  return { items, error: null };
}

function parseIPv4(value) {
  const parts = value.trim().split(".");
  if (parts.length !== 4 || parts.some(part => !/^\d{1,3}$/.test(part))) {
    return null;
  }

  const octets = parts.map(Number);
  if (octets.some(octet => octet < 0 || octet > 255)) {
    return null;
  }

  return octets.reduce((address, octet) => address * 256 + octet, 0);
}

function parseNetworkInput(value) {
  const parts = value.trim().split("/");
  if (parts.length > 2) {
    return null;
  }

  const address = parseIPv4(parts[0]);
  if (address === null) {
    return null;
  }

  let prefix = null;
  if (parts.length === 2) {
    if (!/^\d{1,2}$/.test(parts[1])) {
      return null;
    }
    prefix = Number(parts[1]);
    if (prefix > 32) {
      return null;
    }
  }

  return { address, prefix, octets: parts[0].split(".").map(Number) };
}

function prefixToMask(prefix) {
  if (prefix === 0) {
    return 0;
  }

  return (0xffffffff << (32 - prefix)) >>> 0;
}

function integerToIP(address) {
  return [
    Math.floor(address / 16777216),
    Math.floor(address / 65536) % 256,
    Math.floor(address / 256) % 256,
    address % 256
  ].join(".");
}

function renderResults(allocations, networkStart, prefix) {
  const supernetSize = 2 ** (32 - prefix);
  const networkEnd = networkStart + supernetSize - 1;
  const allocatedAddresses = allocations.reduce(
    (total, allocation) => total + allocation.totalAddresses,
    0
  );
  const remainingAddresses = supernetSize - allocatedAddresses;
  const lines = [
    formatResultLine("Supernet:", `${integerToIP(networkStart)}/${prefix}`),
    "- ".repeat(20).trimEnd(),
    formatResultLine("Subnet Mask:", integerToIP(prefixToMask(prefix))),
    formatResultLine("CIDR:", `/${prefix}`),
    formatResultLine("Host Bits:", 32 - prefix),
    "",
    "Departments:",
    "= ".repeat(20).trimEnd()
  ];

  allocations.forEach((allocation, index) => {
    const networkLabel = `${allocation.name}: ID`;
    const departmentLines = [];
    if (networkLabel.length <= 20) {
      departmentLines.push(formatResultLine(networkLabel, `${integerToIP(allocation.network)}/${allocation.prefix}`));
    } else {
      departmentLines.push(
        `${allocation.name}:`,
        formatResultLine("Network ID:", `${integerToIP(allocation.network)}/${allocation.prefix}`)
      );
    }

    departmentLines.push(
      `\t${formatResultLine("First Valid IP:", integerToIP(allocation.firstHost))}`,
      `\t${formatResultLine("Last Valid IP:", integerToIP(allocation.lastHost))}`,
      formatResultLine("Broadcast Address:", integerToIP(allocation.broadcast)),
      `\n${formatResultLine("Total Addresses:", allocation.totalAddresses)}`,
      formatResultLine("Usable Hosts:", allocation.usableHosts)
    );
    lines.push(...departmentLines);

    if (index < allocations.length - 1) {
      lines.push("- ".repeat(20).trimEnd());
    }
  });

  const remainingStart = allocations.length
    ? allocations[allocations.length - 1].broadcast + 1
    : networkStart;
  const remainingFirst = remainingAddresses > 0 ? remainingStart : null;
  const remainingLast = remainingAddresses > 0 ? networkEnd : null;
  const supernetFirst = supernetSize > 2 ? networkStart + 1 : networkStart;
  const supernetLast = supernetSize > 2 ? networkEnd - 1 : networkEnd;

  lines.push(
    "= ".repeat(20).trimEnd(),  
    formatResultLine("Remaining on Supernet:", `${integerToIP(networkStart)}/${prefix}`),
    formatResultLine("Unallocated Addresses:", remainingAddresses),
    `\n${formatResultLine("First Unallocated:", remainingFirst === null ? "None" : integerToIP(remainingFirst))}`,
    formatResultLine("Last Unallocated:", remainingLast === null ? "None" : integerToIP(remainingLast)),
    `\n${formatResultLine("First Valid IP:", integerToIP(supernetFirst))}`,
    formatResultLine("Last Valid IP:", integerToIP(supernetLast)),
    formatResultLine("Broadcast Address:", integerToIP(networkEnd))
  );

  results.textContent = lines.join("\n");
}

function formatResultLine(label, value) {
  return `${label.padEnd(20)} ${value}`;
}

function clearResults() {
  results.classList.remove("text-red-600");
  results.replaceChildren();
}

function showError(message) {
  results.classList.add("text-red-600");
  results.textContent = message;
}
