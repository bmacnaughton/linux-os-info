linux-os-info
=================

Get OS release info for Linux releases from the `'/etc/os-release'` file and from the node `os` module. On Windows and Macs it only returns the node `os` module info (platform, hostname, release, and arch)

### Highlights
* Lightweight without any dependencies (only native Node modules)
* Synchronous, asynchronous, and promise - choose how you want to use it.


## Installation

    npm install --save linux-os-info

## Usage

```
const osInfo = require('linux-os-info')

// the example presumes running some flavor of linux.

// synchronous - use an options argument with {synchronous: true}
var result = osInfo({synchronous: true})
console.log(`You are using ${result.pretty_name} on a ${result.arch} machine`)

// asynchronous - pass a function as an argument
osInfo(function (err, result) {
  console.log(`You are using ${result.pretty_name} on a ${result.arch} machine`)
})

// promise - no arguments
osInfo()
  .then(result => {
    console.log(`You are using ${result.pretty_name} on a ${result.arch} machine`)
  })
  .catch(err => console.error(`Error reading OS release info: ${err}`))

```
On my machine all three versions output:
```
You are using Ubuntu 18.04 LTS on a x64 machine
```



#### Sample outputs

These example outputs are courtesy of Samuel Carreira. His (linux-release-info)[https://github.com/samuelcarreira/linux-release-info] combined with my wanting a synchronous version were the inspiration for this package.

**Linux**
```
{ type: 'Linux',
  platform: 'linux',
  hostname: 'VirtualBoxLINUX',
  arch: 'x64',
  release: '4.13.0-32-generic',
  name: 'Ubuntu',
  version: '17.10 (Artful Aardvark)',
  id: 'ubuntu',
  id_like: 'debian',
  pretty_name: 'Ubuntu 17.10',
  version_id: '17.10',
  home_url: 'https://www.ubuntu.com/',
  support_url: 'https://help.ubuntu.com/',
  bug_report_url: 'https://bugs.launchpad.net/ubuntu/',
  privacy_policy_url: 'https://www.ubuntu.com/legal/terms-and-policies/privacy-policy',
  version_codename: 'artful',
  ubuntu_codename: 'artful' }
```
**Linux (Raspberry Pi)**
```
{ type: 'Linux',
  platform: 'linux',
  hostname: 'raspberrypi',
  arch: 'arm',
  release: '4.9.59-v7+',
  pretty_name: 'Raspbian GNU/Linux 9 (stretch)',
  name: 'Raspbian GNU/Linux',
  version_id: '9',
  version: '9 (stretch)',
  id: 'raspbian',
  id_like: 'debian',
  home_url: 'http://www.raspbian.org/',
  support_url: 'http://www.raspbian.org/RaspbianForums',
  bug_report_url: 'http://www.raspbian.org/RaspbianBugs' }
```
**Linux (Fedora)**
```
{ type: 'Linux',
  platform: 'linux',
  hostname: 'localhost-live',
  arch: 'x64',
  release: '4.13.9-300.fc27.x86_64',
  name: 'Fedora',
  version: '27 (Workstation Edition)',
  id: 'fedora',
  version_id: '27',
  pretty_name: 'Fedora 27 (Workstation Edition)',
  ansi_color: '0;34',
  cpe_name: 'cpe:/o:fedoraproject:fedora:27',
  home_url: 'https://fedoraproject.org/',
  support_url: 'https://fedoraproject.org/wiki/Communicating_and_getting_help',
  bug_report_url: 'https://bugzilla.redhat.com/',
  redhat_bugzilla_product: 'Fedora',
  redhat_bugzilla_product_version: '27',
  redhat_support_product: 'Fedora',
  redhat_support_product_version: '27',
  privacy_policy_url: 'https://fedoraproject.org/wiki/Legal:PrivacyPolicy',
  variant: 'Workstation Edition',
  variant_id: 'workstation' }
```
**Windows**
```
{ type: 'Windows_NT',
  platform: 'win32',
  hostname: 'MYPC',
  arch: 'x64',
  release: '10.0.16299' }
```
**macOS**
```
{ type: 'Darwin',
  platform: 'darwin',
  hostname: 'Macbook-Air.home',
  arch: 'x64',
  release: '16.0.0' }
```

#### Windows and Macs?
If you want info about Windows or Mac releases, you can try the following modules from sindresorhus:
https://www.npmjs.com/package/win-release
or
https://www.npmjs.com/package/macos-release


## License
Licensed under MIT
