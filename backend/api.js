const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const parseSave = (buffer) => {
  return {
    coins: buffer.readUInt32LE(0x10),
    keys: buffer.readUInt32LE(0x20),
    weaponDurability: buffer.readUInt32LE(0x30),
    ghostStats: {
      total: buffer.readUInt8(0x40),
      greenie: buffer.readUInt8(0x41),
      slammer: buffer.readUInt8(0x42),
      hider: buffer.readUInt8(0x43),
      bossDefeated: buffer.readUInt8(0x44) === 1
    },
    rooms: {
      bathroom: buffer.readUInt8(0x50) === 1,
      basement: buffer.readUInt8(0x51) === 1,
      rooftop: buffer.readUInt8(0x52) === 1
    }
  };
};

const buildSave = (data) => {
  const buffer = Buffer.alloc(512);
  buffer.writeUInt32LE(data.coins, 0x10);
  buffer.writeUInt32LE(data.keys, 0x20);
  buffer.writeUInt32LE(data.weaponDurability, 0x30);
  buffer.writeUInt8(data.ghostStats.total, 0x40);
  buffer.writeUInt8(data.ghostStats.greenie, 0x41);
  buffer.writeUInt8(data.ghostStats.slammer, 0x42);
  buffer.writeUInt8(data.ghostStats.hider, 0x43);
  buffer.writeUInt8(data.ghostStats.bossDefeated ? 1 : 0, 0x44);
  buffer.writeUInt8(data.rooms.bathroom ? 1 : 0, 0x50);
  buffer.writeUInt8(data.rooms.basement ? 1 : 0, 0x51);
  buffer.writeUInt8(data.rooms.rooftop ? 1 : 0, 0x52);
  return buffer;
};

app.post('/api/parse', (req, res) => {
  const file = req.files.file;
  const data = parseSave(file.data);
  res.json(data);
});

app.post('/api/save', (req, res) => {
  const buffer = buildSave(req.body);
  res.setHeader('Content-Disposition', 'attachment; filename=edited.save');
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(buffer);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
