# IBB FIAE Subnet Calculators

Table of Contents

<!-- vscode-markdown-toc -->
* [Introduction](#Introduction)
* [Features](#Features)
	* [Improvements](#Improvements)
* [Getting Started](#GettingStarted)
	* [Requirements](#Requirements)
	* [Installation](#Installation)
	* [Usage](#Usage)
* [Project Structure](#ProjectStructure)
* [Short guide about the git flow](#Shortguideaboutthegitflow)
* [License](#License)
* [Development Notes](#DevelopmentNotes)
* [About the Author](#AbouttheAuthor)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a name='Introduction'></a>Introduction

A simple browser-based IP subnet calculator for v4 and v6, built with HTML, JavaScript, and Tailwind CSS.

The calculator accepts an IP address and either a CIDR value or a subnet mask. It calculates the corresponding subnet information, including the network address, valid host range, broadcast address, and number of usable hosts.

This project was created as part of the ITT-Net-IS module during the IBB FIAE training program, with great enthusiasm and a strong desire to help my fellow students calculate and understand IPv4 and IPv6 subnets.

See it on Github: [IBB FIAE subnetting calculator.html](https://mike-lima-uno.github.io/IBB_FIAE_subnetting_calculator/)


I use: <a href="https://www.flaticon.com/free-icons/left-arrow" title="left arrow icons">Left arrow icons created by Magnific - Flaticon</a>

## <a name='Features'></a>Features

- **IPv4 and IPv6 calculators:** calculate network details from an address and CIDR prefix or subnet mask.
- **Subnetting calculators:** divide IPv4 or IPv6 networks into equal-sized subnets.
- **IPv4 VLSM calculator:** allocate differently sized subnets from a list of departments and required hosts. Use private Class A, B, or C presets, or enter a custom network in CIDR notation.
- **Network details:** show subnet mask, CIDR, host bits, network ID, valid host range, broadcast address, and address/host counts where applicable.
- **Light and dark themes:** follow the system preference by default and can be switched manually.
- **Keyboard and validation:** press `Enter` to calculate, use `Tab` and `Shift + Tab` to navigate, and receive invalid-input feedback in the results area.

### <a name='Improvements'></a>Improvements

[ ] The addOne() and subtractOne() functions only change the final octet.  
    They do not handle rollover or borrowing, e.g.:  
     * 192.168.1.255 + 1 should become 192.168.2.0.  
     * 192.168.2.0 - 1 should become 192.168.1.255.  

[ ] The same for IPv6.

## <a name='GettingStarted'></a>Getting Started

### <a name='Requirements'></a>Requirements

A modern web browser is required. No server or build process is necessary. Tailwind CSS is loaded from its CDN, so an internet connection is needed for the page styling.

### <a name='Installation'></a>Installation

Clone the repository:

```bash
git clone https://github.com/mike-lima-uno/IBB_FIAE_subnetting_calculator.git
cd IBB_FIAE_subnetting_calculator
```

Open the root `index.html` in a web browser and choose a calculator.

### <a name='Usage'></a>Usage

For a standard IPv4 or IPv6 calculation:

1. open the matching calculator, 
2. enter the address and CIDR prefix or subnet mask, 
3. then select **Calculate** or press `Enter`.

For VLSM, select a private Class A, B, or C preset, or enter a custom IPv4 network in `address/prefix` format (for example, `192.168.10.0/24`). Describe each department on a separate line as `Department: required hosts`, then select **Calculate**.

IPv4 CIDR prefixes range from 0 to 32. IPv4 octets must be between 0 and 255.

## <a name='ProjectStructure'></a>Project Structure

```text
IBB_FIAE_subnetting_calculator/
├── assets/
├── calculator_ipv4/
├── calculator_ipv6/
├── subnetting_home/
├── subnetting_ipv4/
├── subnetting_ipv6/
├── subnetting_vlsm/
├── index.html
├── LICENSE
└── README
```

## <a name='Shortguideaboutthegitflow'></a>Short guide about the git flow

This project uses a simple two-branch workflow: make and push development commits on `dev`, then fast-forward `main` after the work is ready. This keeps history linear and avoids creating a merge commit. Review the staged changes before committing; `git add -A` stages all changes in the repository.

```bash
# 1. Create dev once, if it does not exist yet
git switch main
git pull --ff-only origin main
git switch -c dev
git push -u origin dev

# 2. Develop on dev (repeat as needed)
git switch dev
git status --short
git add -A
git diff --cached --check
git diff --cached
git commit -m "Describe the change"
git push origin dev

# 3. Fast-forward finished work into main
git switch main
git pull --ff-only origin main
git merge --ff-only dev
git push origin main

# 4. Return to dev
git switch dev
git pull --ff-only origin dev
```

If `git merge --ff-only dev` refuses to merge, the branches have diverged. Stop and inspect the log instead of forcing the merge.

Useful status and history checks:

```bash
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

The log options mean:

* --oneline — one compact line per commit
* --graph — shows branch structure using *, |, and /
* --decorate — shows branch and tag names
* --all — includes all local branches, not only the current branch


## <a name='License'></a>License

Copyright (c) 2026 Cicero Lima

This project is licensed under the MIT License.
See the  [LICENSE](LICENSE) file for the full license text.

## <a name='DevelopmentNotes'></a>Development Notes

Parts of the implementation and documentation were developed with assistance
from an AI coding assistant. The author reviewed and remains responsible for
the final code.

## <a name='AbouttheAuthor'></a>About the Author

I'm mike-lima-uno.  

Cicero Lima holds an M.Sc. in Mechanical Engineering and is a PCAP-certified Python developer. He is also a father of three children and is currently attending a German FIAE training program with the goal of becoming an IHK-certified IT professional.

After five years of working mainly with Python, Siemens PLCs, and WinCC, he has spent the past three years developing solutions with JavaScript, Google Workspace, and Google Apps Script. This experience includes creating practical applications, automating workflows, and improving everyday processes.

This project was created as part of the ITT-Net-IS module during the IBB FIAE training program. It was motivated by a strong interest in networking and a desire to help fellow students calculate IPv4 subnets more easily.

Cicero is particularly interested in networking, web technologies, and cybersecurity. He enjoys challenging projects, learning through practical applications, and exploring how software and digital systems work from the ground up.

