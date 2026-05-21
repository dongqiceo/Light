const users = [
  { id: 0, name: 'Umi', nickName: 'U', gender: 'MALE' },
  { id: 1, name: 'Fish', nickName: 'B', gender: 'FEMALE' },
];

export default {
  'GET /api/v1/queryUserList': (req: any, res: any) => {
    res.json({
      success: true,
      data: { list: users },
      errorCode: 0,
    });
  },
  'PUT /api/v1/user/': (req: any, res: any) => {
    res.json({
      success: true,
      errorCode: 0,
    });
  },
  'POST /api/v1/login': (req: any, res: any) => {
    const { username, password } = req.body;
    // 简单验证，实际项目中应该使用加密和数据库验证
    if (username === 'admin' && password === '123456') {
      res.json({
        code: 100000,
        message: '操作成功',
        data: {
          token: 'mock-token',
          user: {
            id: 0,
            name: 'Admin',
            nickName: 'Admin',
            gender: 'MALE',
          },
        },
      });
    } else {
      res.json({
        code: 401,
        message: '用户名或密码错误',
        data: null,
      });
    }
  },
  'GET /api/v1/logout': (req: any, res: any) => {
    res.json({
      code: 100000,
      message: '操作成功',
      data: null,
    });
  },
};
