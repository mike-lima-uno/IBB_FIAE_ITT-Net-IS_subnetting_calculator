# README

<!-- vscode-markdown-toc -->
* [IBB FIAE IPv4 Subnet Calculator](#IBBFIAEIPv4SubnetCalculator)
* [Features](#Features)
* [Getting Started](#GettingStarted)
	* [Requirements](#Requirements)
	* [Installation](#Installation)
	* [Usage](#Usage)
* [Project Structure](#ProjectStructure)
* [Short guide about the git flow](#Shortguideaboutthegitflow)
* [License](#License)
* [About the Author](#AbouttheAuthor)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a name='IBBFIAEIPv4SubnetCalculator'></a>IBB FIAE IPv4 Subnet Calculator

A simple browser-based IPv4 subnet calculator built with HTML, JavaScript, and Tailwind CSS.

The calculator accepts an IPv4 address and either a CIDR value or a subnet mask. It calculates the corresponding subnet information, including the network address, valid host range, broadcast address, and number of usable hosts.

This project was created as part of the ITT-Net-IS module during the IBB FIAE training program, with great enthusiasm and a strong desire to help my fellow students calculate IPv4 subnets.

See it on Github: [IBB FIAE subnetting calculator.html](https://mike-lima-uno.github.io/IBB_FIAE_subnetting_calculator/)

## <a name='Features'></a>Features

- Enter an IPv4 address using four octets.
- Calculate a subnet mask from a CIDR value.
- Calculate a CIDR value from a subnet mask.
- Display the network address.
- Display the first and last valid IP addresses.
- Display the broadcast address.
- Display host-bit and address-count information.
- Press `Enter` to calculate.
- Use `Tab` and `Shift + Tab` to move between fields.
- Scroll through results when necessary.
- Display invalid input in red.

### Improvements

[ ] The addOne() and subtractOne() functions only change the final octet.  
    They do not handle rollover or borrowing, e.g.:  
     * 192.168.1.255 + 1 should become 192.168.2.0.  
     * 192.168.2.0 - 1 should become 192.168.1.255.  


## <a name='GettingStarted'></a>Getting Started

### <a name='Requirements'></a>Requirements

A modern web browser is required. No server or build process is necessary.

### <a name='Installation'></a>Installation

Clone the repository:

```bash
git clone https://github.com/mike-lima-uno/IBB_FIAE_subnetting_calculator.git
```

Move into the project directory:

```bash
cd ipv4-subnet-calculator
```

Open index.html in a web browser.

### <a name='Usage'></a>Usage

1. Enter an IPv4 address.
2. Enter a CIDR value, such as 27, or complete all four subnet-mask fields.
3. Select Calculate or press Enter.
4. Review the calculated subnet information in the results area.

A CIDR value must be between 0 and 32. IPv4 and subnet-mask octets must be between 0 and 255.

## <a name='ProjectStructure'></a>Project Structure

```text
ipv4-subnet-calculator/
├── index.html
├── ipv4.html
├── ipv6.html
├── LICENSE
├── README.md
└── CONTRIBUTING.md
```

## <a name='Shortguideaboutthegitflow'></a>Short guide about the git flow


I'll follow the steps under:
```ps
# 1. Create dev the first time
git switch main
git pull origin main
git switch -c dev
git push -u origin dev

# 2. Develop (LOOP IT)
git add .
git commit -m "Describe the change"
git push origin dev

# 3. Merge finished work into main / change the message if necessary
git switch main
git pull origin main
git merge dev --no-ff -m "merge dev into main"
git push -u origin main:main dev:dev

# 4. Start the next development cycle and go back to Nr. 2
git switch dev
```

Then check it:

```ps
# change branch to dev
git checkout dev

# chance branch to main
git checkout main

# check the branch and where you are. should return branch names. asterisc shows where you are
git branch
#   dev
# * main

# checking git log in a nut shell
git log --oneline --graph --decorate --all
```

The options mean:

* --oneline — one compact line per commit
* --graph — shows branch structure using *, |, and /
* --decorate — shows branch and tag names
* --all — includes all local branches, not only the current branch


## <a name='License'></a>License

Copyright (c) 2026 Cicero Lima

This project is licensed under the MIT License.
See the  [LICENSE](LICENSE) file for the full license text.

## Development Notes

Parts of the implementation and documentation were developed with assistance
from an AI coding assistant. The author reviewed and remains responsible for
the final code.

## <a name='AbouttheAuthor'></a>About the Author

I'm mike-lima-uno.  

Cicero Lima holds an M.Sc. in Mechanical Engineering and is a PCAP-certified Python developer. He is also a father of three children and is currently attending a German FIAE training program with the goal of becoming an IHK-certified IT professional.

After five years of working mainly with Python, Siemens PLCs, and WinCC, he has spent the past three years developing solutions with JavaScript, Google Workspace, and Google Apps Script. This experience includes creating practical applications, automating workflows, and improving everyday processes.

This project was created as part of the ITT-Net-IS module during the IBB FIAE training program. It was motivated by a strong interest in networking and a desire to help fellow students calculate IPv4 subnets more easily.

Cicero is particularly interested in networking, web technologies, and cybersecurity. He enjoys challenging projects, learning through practical applications, and exploring how software and digital systems work from the ground up.

