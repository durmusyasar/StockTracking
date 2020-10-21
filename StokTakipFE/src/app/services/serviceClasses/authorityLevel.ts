export let authorityLevel;
(function (authorityLevel) {
  const typeStrings: { [key: string]: string } = {
    User: 'Kullanıcı',
    Admin: 'Yönetici',
    WarehouseWorker: 'Depo Görevlisi',
    1: 'User',
    2: 'WarehouseWorker',
    '-2147483648': 'Admin',
  };

  authorityLevel[authorityLevel.User = 1] = 'User';
  authorityLevel[authorityLevel.Admin = -2147483648] = 'Admin';
  authorityLevel[authorityLevel.WarehouseWorker = 2] = 'WarehouseWorker';

  authorityLevel.toString = (type) => {
    return typeStrings[authorityLevel[type]];
  };

})(authorityLevel || (authorityLevel = {}));
