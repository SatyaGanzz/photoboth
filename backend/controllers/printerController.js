const { v4: uuidv4 } = require('uuid');

const printJobs = {};

exports.getPrinters = (req, res) => {
  res.json({
    status: 'success',
    code: 200,
    data: {
      printers: [
        {
          id: 'printer_canon_selphy',
          name: 'Canon SELPHY CP1500 / Photo Printer',
          status: 'idle',
          paperSizes: ['4x6', '5x7', '2x6 strip'],
          defaultPaperSize: '4x6',
          location: 'Booth Counter'
        },
        {
          id: 'printer_dnp_rx1',
          name: 'DNP DS-RX1HS Dye-Sublimation',
          status: 'idle',
          paperSizes: ['4x6', '6x8', '2x6 strip'],
          defaultPaperSize: '4x6',
          location: 'Booth Main'
        }
      ],
      total: 2
    }
  });
};

exports.getSettings = (req, res) => {
  res.json({
    status: 'success',
    code: 200,
    data: {
      paperSizes: [
        { value: '4x6', label: '4x6 inches (Standard Postcard)' },
        { value: '5x7', label: '5x7 inches (Large Portrait)' },
        { value: '2x6', label: '2x6 inches (Photo Strip 3x1)' }
      ],
      dpiOptions: [200, 300, 600],
      colorModes: ['color', 'bw', 'sepia'],
      qualityOptions: ['draft', 'normal', 'high', 'photo']
    }
  });
};

exports.previewPrint = (req, res) => {
  const { layoutId, printerSettings = {} } = req.body;
  res.json({
    status: 'success',
    code: 200,
    data: {
      previewUrl: `/photos/default_session/${layoutId}.jpg`,
      settings: printerSettings,
      estimatedTime: '25 seconds'
    }
  });
};

exports.sendToPrinter = (req, res) => {
  const { layoutId, printerSettings = {} } = req.body;
  const printJobId = `print_${Date.now()}_${uuidv4().substring(0, 6)}`;

  printJobs[printJobId] = {
    printJobId,
    layoutId,
    printerId: printerSettings.printerId || 'printer_canon_selphy',
    copies: printerSettings.copies || 1,
    status: 'printing',
    progress: 10,
    sentAt: new Date().toISOString()
  };

  // Simulate printing progress
  setTimeout(() => {
    if (printJobs[printJobId]) {
      printJobs[printJobId].status = 'completed';
      printJobs[printJobId].progress = 100;
    }
  }, 4000);

  res.json({
    status: 'success',
    code: 200,
    data: {
      printJobId,
      status: 'queued',
      printerId: printerSettings.printerId || 'printer_canon_selphy',
      layoutId,
      copies: printerSettings.copies || 1,
      estimatedTime: '30 seconds',
      queuePosition: 1,
      sentAt: printJobs[printJobId].sentAt
    }
  });
};

exports.getJobStatus = (req, res) => {
  const { printJobId } = req.params;
  const job = printJobs[printJobId] || {
    printJobId,
    status: 'completed',
    progress: 100
  };

  res.json({
    status: 'success',
    code: 200,
    data: job
  });
};
