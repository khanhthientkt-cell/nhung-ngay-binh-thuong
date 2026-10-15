/*
 * story.js — Toàn bộ nội dung chữ của câu chuyện, tách riêng khỏi phần giao diện.
 *
 * Gồm: các chương (tên lấy nguyên văn bản mô tả), lá thư mở đầu, lời kể Chương 1–4 theo nhịp,
 * nội dung Chương 5 (lựa chọn chuyến đi, bưu thiếp, lời cuối, dòng kết) và câu chữ giao diện.
 * Danh sách câu đã chốt / đang chờ duyệt: xem ASSETS.md. Mở index.html#debug để thấy câu nháp trên giao diện.
 *
 * Quy ước khi thêm nội dung:
 *   - Đoạn đã chốt nguyên văn:          approved: true
 *   - Đoạn chưa được duyệt:             draft: true  +  chú thích [NHÁP – cần duyệt]
 *   - Không bịa thêm sự kiện, lời thoại hay địa điểm thật.
 */
window.NNBT = window.NNBT || {};

(function (NNBT) {
  'use strict';

  const title = 'Những ngày bình thường của chúng mình';

  // ---------- Ảnh thật (assets/photos/) ----------
  // Ghép ảnh theo xác nhận của anh. Ảnh đã nén và xóa metadata (EXIF/GPS).
  const photo = (file, w, h, alt) => ({ src: 'assets/photos/' + file, w, h, alt });
  const PHOTOS = {
    start:      photo('start-photobooth.jpg', 537, 562, 'Ảnh: dải ảnh photobooth của hai người.'),
    volunteer:  photo('ch1-tinh-nguyen-da-lat.jpg', 563, 790, 'Ảnh: anh cúi xuống bên các em nhỏ trong chuyến đi tình nguyện ở Đà Lạt.'),
    dalatRoad:  photo('ch1-con-duong-da-lat.jpg', 532, 765, 'Ảnh: con đường buổi tối ở Đà Lạt mà hai người từng đi cùng nhau.'),
    meal1:      photo('ch2-bua-com-1.jpg', 545, 800, 'Ảnh: một bữa cơm anh nấu cho vợ.'),
    meal2:      photo('ch2-bua-com-2.jpg', 559, 782, 'Ảnh: một bữa cơm anh nấu cho vợ.'),
    meal3:      photo('ch2-bua-com-3.jpg', 539, 779, 'Ảnh: một bữa cơm anh nấu cho vợ.'),
    cheek:      photo('ch3-ap-ma.jpg', 554, 790, 'Ảnh: hai người áp má vào nhau.'),
    reunion:    photo('ch4-qua-gap-lai.jpg', 573, 693, 'Ảnh: bó hoa và những món quà anh tặng vợ khi hai người gặp lại nhau lần đầu trong thời gian yêu xa.'),
    kimono:     photo('ch4-nhat-kimono.jpg', 495, 501, 'Ảnh: hai người mặc kimono trong chuyến đi Nhật Bản.'),
    busStop:    photo('ch4-nhat-tram-xe-buyt.jpg', 531, 765, 'Ảnh: vợ ngồi ở trạm xe buýt trong chuyến đi Nhật Bản.'),
    feet:       photo('ch4-hai-doi-chan.jpg', 557, 710, 'Ảnh: hai đôi chân đứng cạnh nhau.'),
    flowers:    photo('ch5-vo-tuong-hoa.jpg', 505, 792, 'Ảnh: vợ đứng trước bức tường hoa.'),
    river:      photo('ch5-vo-ben-song.jpg', 534, 727, 'Ảnh: chân dung vợ bên bờ sông.')
  };

  // step:   bước triển khai dự kiến (chỉ dùng cho ghi chú trong khung tạm).
  // ready:  true = nội dung chương đã sẵn sàng để chơi. KHÔNG tự mở khóa chương.
  //         Chương chỉ được mở khi nó là "Chặng tiếp theo" trên bản đồ VÀ người chơi chủ động chạm vào
  //         (xem onStop trong js/screens/map.js — nơi duy nhất đọc cờ này).
  // screen: màn hình hiển thị chương (mặc định 'chapter').
  // icon:   biểu tượng trên bản đồ hành trình (vẽ trong js/screens/map.js), lấy từ các hình ảnh trong bản mô tả.
  // place:  địa danh hiện trên bản đồ — CHỈ ghi khi đã được xác nhận.
  const chapters = [
    { id: 'prologue', label: 'Mở đầu',   title: 'Lá thư chưa gửi',                    step: 2, screen: 'letter', icon: 'letter' },
    { id: 'ch1',      label: 'Chương 1', title: 'Chiếc ô trong mưa',                  step: 3, icon: 'umbrella', place: 'Đà Lạt', ready: true },
    { id: 'ch2',      label: 'Chương 2', title: 'Những ngày chẳng có gì đặc biệt',    step: 3, icon: 'helmet', ready: true },
    { id: 'ch3',      label: 'Chương 3', title: 'Nơi anh được làm một đứa trẻ',       step: 3, icon: 'song', ready: true },
    { id: 'ch4',      label: 'Chương 4', title: 'Hai nơi, một câu chuyện',            step: 3, icon: 'houses', ready: true },
    { id: 'ch5',      label: 'Chương 5', title: 'Chuyến đi tiếp theo của chúng mình', step: 4, icon: 'aurora', screen: 'finale', ready: true }
  ];

  // ---------- Chương 5 — Chuyến đi tiếp theo của chúng mình ----------
  // Màn hình riêng: js/screens/finale.js. Bưu thiếp vẽ bằng js/components/postcard.js.
  // ĐÃ CHỐT (nguyên văn): 4 lựa chọn chuyến đi (3 lựa chọn đầu), dòng kết thúc.
  // Giấc mơ cực quang (dream) và lời cuối (letter): nguyên văn bản anh tự hoàn thiện ngày 15/10/2026.
  const finale = {
    blank: {
      // ĐÃ DUYỆT
      text: { paragraphs: [
        'Những chặng đã qua, mình đã cùng đi hết trên bản đồ.',
        'Còn chặng tiếp theo thì vẫn là một trang giấy trống.'
      ] },
      alt: 'Tranh màu nước: tấm bản đồ mở rộng thành một trang giấy; con đường chấm của những chặng đã qua dừng lại, phía trước là khoảng giấy trống và một vệt sáng cực quang mờ ở góc.'
    },
    choose: {
      prompt: { text: 'Chuyến đi tiếp theo của chúng mình, em muốn đó là chuyến đi như thế nào?' },
      options: [
        {
          id: 'slow',
          label: 'Một chuyến đi thật chậm, với quán cà phê, những con đường và thời gian ở cạnh nhau.', // ĐÃ CHỐT
          postcardLine: { text: 'Một chuyến đi thật chậm: vài quán cà phê, những con đường, và thật nhiều thời gian ở cạnh nhau.' },
          alt: 'con đường chiều uốn qua đồi, hàng cây và một chiếc bàn cà phê với hai chiếc ly'
        },
        {
          id: 'new',
          label: 'Một nơi mới để cùng khám phá.', // ĐÃ CHỐT
          postcardLine: { text: 'Một nơi mới, để hai đứa mình cùng nhau khám phá.' },
          alt: 'tấm bản đồ mở ra, đường chấm dẫn tới một ngôi sao, phía xa là núi mờ sương'
        },
        {
          id: 'aurora',
          label: 'Dưới bầu trời cực quang, một giấc mơ tương lai của hai người.', // ĐÃ CHỐT
          postcardLine: { text: 'Dưới bầu trời cực quang, giấc mơ tương lai của hai đứa mình.' },
          alt: 'bầu trời đêm đầy sao với dải cực quang xanh, một chiếc lều sáng ấm trên đồi tuyết, hai hàng dấu chân đi cạnh nhau dẫn tới lều'
        },
        {
          id: 'custom',
          // ĐÃ DUYỆT Cách gọi lựa chọn "Một địa điểm do vợ tự nhập".
          label: 'Một nơi em tự chọn.',
          postcardLine: { text: 'Một nơi do em chọn, để hai đứa mình cùng đến.' },
          alt: 'tấm bản đồ giấy, đường chấm dẫn tới chiếc ghim đánh dấu nơi em chọn'
        }
      ],
      // ĐÃ DUYỆT Các câu giao diện của bước chọn
      placeLabel: { text: 'Nơi em muốn đến' },
      placeHint: { text: 'Gõ tên một nơi bất kỳ.' },
      placeRequired: { text: 'Em gõ tên nơi muốn đến nhé.' },
      chooseRequired: { text: 'Em chọn một chuyến đi nhé.' },
      messageLabel: { text: 'Lời nhắn (không bắt buộc)' },
      messageNote: { text: 'Lời nhắn chỉ nằm trong tấm bưu thiếp trên máy này, không được lưu lại hay gửi đi đâu cả.' },
      submit: { text: 'Tạo bưu thiếp' },
      placeMax: 60,
      messageMax: 300
    },
    postcard: {
      heading: 'Chuyến đi tiếp theo của chúng mình', // tên Chương 5 (đã chốt)
      // ĐÃ DUYỆT
      placeLabel: { text: 'Điểm đến' },
      messageHeading: { text: 'Lời nhắn của em' },
      footer: 'Những ngày bình thường của chúng mình · 20/10',
      stampDate: '20·10',
      filename: 'buu-thiep-nhung-ngay-binh-thuong.png',
      status: {
        preparing: { text: 'Đang vẽ bưu thiếp…' },
        ready: { text: 'Bưu thiếp đã sẵn sàng.' },
        saved: { text: 'Đã tạo tệp ảnh. Nếu máy không tự tải về, em nhấn giữ vào tấm bưu thiếp để lưu nhé.' },
        shared: { text: 'Đã mở bảng chia sẻ.' },
        error: { text: 'Chưa tạo được ảnh bưu thiếp. Em thử lại nhé, hoặc chụp màn hình tấm bưu thiếp này.' }
      },
      save: { text: 'Lưu ảnh bưu thiếp' },
      share: { text: 'Chia sẻ ảnh' },
      retry: { text: 'Thử lại' },
      rechoose: { text: 'Chọn lại chuyến đi' },
      next: 'Tiếp tục'
    },
    // NGUYÊN VĂN BẢN ANH TỰ HOÀN THIỆN (15/10/2026) — Chương 5, Đoạn 1: giấc mơ dưới bầu trời cực quang.
    // Hiện ngay sau trang giấy trống, trước bước chọn chuyến đi.
    dream: {
      text: [
        'Chuyến đi tiếp theo của chúng mình sẽ là chuyến đi nào, đi đến đâu, anh vẫn chưa biết nữa. Nhưng có một điều anh biết chắc, đó là anh sẽ cố gắng hết sức để một ngày nào đó có thể cầu hôn vợ anh dưới bầu trời cực quang rực rỡ. Anh mong rằng khi ấy, mình không chỉ được cùng nhau ngắm nhìn một khung cảnh thật đẹp, mà còn có thể bắt đầu một hành trình mới, nơi anh và vợ sẽ tiếp tục đồng hành cùng nhau trong những năm tháng sau này.'
      ],
      alt: 'Tranh màu nước: bầu trời đêm đầy sao với dải cực quang xanh rực rỡ trên đồi tuyết; giữa tuyết là một hộp nhẫn nhỏ đang mở, chiếc nhẫn lấp lánh.'
    },
    // NGUYÊN VĂN BẢN ANH TỰ HOÀN THIỆN (15/10/2026) — Chương 5, Đoạn 2: lời cuối. Dòng cuối là chữ ký.
    letter: {
      approved: true,
      paragraphs: [
        'Có vẻ những lời này đã dài hơn rất nhiều so với một lời chúc 20/10 thông thường rồi, vợ nhỉ? Vợ có biết tại sao không? Vì tầm này năm ngoái, hai đứa mình cũng chỉ mới chập chững tìm hiểu nhau. Khi ấy, chúng mình tuy chưa chính thức là người yêu, nhưng hình như đã thương nhau nhiều lắm rồi. Vậy nên, anh muốn nhân dịp này cùng vợ nhìn lại một vài kỷ niệm của hai đứa mình, để thấy rằng chúng mình đã đi cùng nhau một đoạn đường dài đến nhường nào.',
        'Nhân ngày 20/10, anh chúc vợ của anh sẽ luôn thật mạnh khỏe, vui vẻ và bình an, và sẽ luôn yêu anh thật nhiều nữa nhé. Vợ cứ yên tâm, vì dù có chuyện gì xảy ra, anh vẫn luôn ở đây, vẫn muốn được lắng nghe, chia sẻ và đồng hành cùng vợ. Anh mong rằng trong những chặng đường sắp tới, chúng mình sẽ còn có thêm thật nhiều kỷ niệm đẹp để cùng nhau nhớ lại, như cách anh và vợ đang làm hôm nay.'
      ],
      signature: 'Thương vợ hết lòng.'
    },
    // ĐÃ CHỐT — dòng kết thúc
    ending: 'Câu chuyện kết thúc ở đây. Còn những ngày bình thường của chúng mình thì vẫn đang tiếp tục.',
    endActions: {
      postcard: { text: 'Xem lại bưu thiếp' },
      memories: 'Xem lại kỷ niệm',
      home: 'Về trang đầu'
    }
  };

  // ---------- Mở đầu — Lá thư chưa gửi ----------
  // ĐÃ CHỐT — nguyên văn, không sửa chữ.
  // Mỗi phần tử của `steps` là một lần hiện chữ khi người chơi bấm "Tiếp tục"; mỗi lần có thể gồm nhiều đoạn.
  // Chỉ chia nhịp đọc, không thêm hay bớt chữ nào.
  const letter = {
    approved: true,
    salutation: 'Em à,',
    steps: [
      ['Em à,', 'Sau đây, anh xin được kể cho vợ một câu chuyện, một câu chuyện về hai chúng mình.'],
      ['Anh muốn vợ biết rằng anh yêu vợ nhiều lắm. Chúc vợ ngày 20/10 thật vui vẻ, luôn mạnh khỏe và lúc nào cũng thật xinh đẹp nhé!'],
      ['Anh yêu em nhiều lắm... Anh chẳng mong gì hơn ngoài việc được chăm sóc, được yêu em đến hết cuộc đời này.'],
      ['Bây giờ, vợ đi cùng anh đến một nơi nhé...'],
      ['Vợ sẵn sàng chưa?']
    ],
    openLabel: 'Mở lá thư',        // ĐÃ CHỐT (bản mô tả)
    finishLabel: 'Đi thôi, anh!'   // ĐÃ CHỐT (bản mô tả)
  };

  // ---------- Nội dung các chương, chia theo nhịp ----------
  // LỜI KỂ CHƯƠNG 1–4: NGUYÊN VĂN BẢN ANH TỰ HOÀN THIỆN (15/10/2026) — không sửa chữ nào, chỉ chia trang.
  // Câu đố, câu trêu, lời nhắc tương tác: theo bản thiết kế anh đã duyệt ("Ổn nhé").
  //
  // Mỗi nhịp (beat):
  //   id       — tên nhịp (dùng để ghi "đã xem")
  //   scene    — lớp minh họa được hiện (xem js/art/)
  //   alt      — mô tả tranh cho trình đọc màn hình
  //   text     — các đoạn chữ hiện ở nhịp này (có thể rỗng khi nhịp chỉ có câu đố / tương tác)
  //   photos   — (tùy chọn) ảnh thật dạng polaroid phủ lên tranh
  //   hotspot  — (tùy chọn) vật có thể chạm trong tranh để sang nhịp sau; x, y tính theo % khung tranh
  //   hint     — (tùy chọn) câu gợi ý nhỏ dưới chữ
  //   interact — (tùy chọn) tương tác phải xong mới đi tiếp (không bao giờ có thua):
  //     quiz : chọn A–D nhận một câu trêu, rồi đáp án E hiện ra; all:true = đáp án nào cũng đúng
  //     open : vợ tự gõ câu trả lời; đúng khoảng 80% là được; trả lời sai 3 lần thì có nút xem đáp án
  //     taps : chạm vào tranh đủ `count` lần (points = vị trí lần lượt của từng lần chạm)
  //     hold : nhấn giữ nút cho đến khi đầy
  const chapterContent = {
    ch1: {
      art: 'ch1',
      beats: [
        {
          id: 'intro',
          scene: 'road',
          photos: [PHOTOS.volunteer],
          alt: 'Tranh màu nước: con phố Đà Lạt ướt mưa, đồi thông mờ sương phía xa, một cột đèn vàng.',
          text: [
            'Em còn nhớ chuyến đi tình nguyện ở Đà Lạt của chúng mình không?',
            'Hồi đó, hai đứa mình còn chưa nói chuyện với nhau nhiều. Ngẫm nghĩ lại, anh thấy cũng thật thần kỳ em nhỉ? Hai con người ở hai nơi khác nhau, cuộc sống vốn chẳng có gì liên quan đến nhau, vậy mà chẳng biết từ khi nào, chúng mình lại trở nên gắn bó đến thế.'
          ]
        },
        {
          id: 'tease',
          scene: 'road',
          alt: 'Tranh màu nước: con phố Đà Lạt ướt mưa, đồi thông mờ sương phía xa, một cột đèn vàng.',
          text: [
            'Có một chuyện nhỏ trong chuyến đi ấy mà anh vẫn nhớ đến tận bây giờ...'
          ]
        },
        {
          id: 'who',
          scene: 'walk',
          alt: 'Tranh màu nước: trên con phố Đà Lạt ướt mưa, ba hàng dấu chân nối nhau đi về phía xa.',
          text: [],
          interact: {
            type: 'open',
            question: 'Tối hôm ấy, em với chị Liên đi dưới mưa cùng ai?',
            answers: ['anh Tâm', 'Tâm'],
            placeholder: 'Em gõ câu trả lời vào đây',
            wrong: 'Hình như chưa đúng, vợ nhớ lại xem nào.',
            reply: 'Đúng rồi! Em nhớ giỏi ghê.',
            reveal: 'Là anh Tâm đó vợ.'
          }
        },
        {
          id: 'rain',
          scene: 'walk',
          alt: 'Tranh màu nước: trên con phố Đà Lạt ướt mưa, ba hàng dấu chân nối nhau đi về phía xa, nước gợn lên ở những bước mới nhất.',
          text: [
            'Buổi tối hôm đó, anh thấy em với chị Liên đang đi cùng anh Tâm dưới trời mưa, mà anh Tâm lại không có ô. Lúc lên xe, anh nhớ mình đã hỏi chú Trí sao em với chị Liên không lên xe. Anh cứ nghĩ, đáng ra người nên đi bộ dưới trời mưa hôm ấy phải là anh mới đúng. Lúc đó, anh chỉ nghĩ rằng mình nhất định phải làm điều gì đó, chứ không thể cứ để em đi dưới mưa như vậy được.'
          ],
          hotspot: { x: 27, y: 62, label: 'Chiếc ô', icon: 'umbrella' },
          hint: { text: 'Chạm vào chiếc ô để đi tiếp nhé.' }
        },
        {
          id: 'quiz-umbrella',
          scene: 'walk',
          alt: 'Tranh màu nước: trên con phố Đà Lạt ướt mưa, ba hàng dấu chân nối nhau đi về phía xa.',
          text: [],
          interact: {
            type: 'quiz',
            question: 'Em đoán xem, tối hôm ấy anh chạy về lấy ô để làm gì?',
            options: [
              { text: 'Để mình khỏi bị ướt', reply: 'Anh có ướt một chút cũng chẳng sao mà.' },
              { text: 'Để trả ô cho chú Trí', reply: 'Không phải đâu nha.' },
              { text: 'Để tập thể dục buổi tối', reply: 'Chạy nhanh thật đấy, nhưng không phải để tập thể dục đâu.' },
              { text: 'Để cho ngầu', reply: 'Cũng có một chút… nhưng chưa phải lý do chính đâu.' }
            ],
            answer: { text: 'Để được nhìn thấy em một lần nữa', reply: 'Đúng rồi đó vợ.' }
          }
        },
        {
          id: 'run',
          scene: 'run',
          alt: 'Tranh màu nước: chiếc ô xanh mở rộng lao qua màn mưa trên con phố Đà Lạt.',
          text: [],
          interact: { type: 'hold', label: 'Giữ để chạy về lấy ô', ms: 1600 },
          hint: { text: 'Nhấn và giữ nút bên dưới nhé.' }
        },
        {
          id: 'umbrella',
          scene: 'return',
          alt: 'Tranh màu nước: một chiếc ô xanh mở rộng lướt qua màn mưa, về phía ba hàng dấu chân trên mặt đường.',
          text: [
            'Anh nhớ lúc đó mình đã chạy thật nhanh về lấy ô, rồi lại chạy thật nhanh quay trở lại, chỉ để được nhìn thấy em một lần nữa. Lúc ấy, anh còn thấy mình ngầu ngầu lắm, vậy mà khi nhìn thấy em, anh lại cảm thấy nhẹ nhõm đến lạ.'
          ]
        },
        {
          id: 'together',
          scene: 'return',
          alt: 'Tranh màu nước: một chiếc ô xanh mở rộng trong mưa, bên cạnh ba hàng dấu chân trên mặt đường.',
          text: [
            'Anh còn nghĩ, em có người yêu rồi mà... Nhưng thôi, cũng chẳng sao cả. Hôm ấy, chỉ cần được đi cùng em một đoạn đường, biết em không bị lạnh, biết em vẫn ổn, với anh lúc đó đã là mãn nguyện lắm rồi.'
          ]
        },
        {
          id: 'dream',
          scene: 'quiet',
          photos: [PHOTOS.dalatRoad],
          alt: 'Tranh màu nước: con phố Đà Lạt vắng trong mưa nhẹ, đèn đường vàng dịu.',
          text: [
            'Đến tận bây giờ vẫn vậy, anh vẫn thường nhớ về cảm giác của ngày hôm ấy. Không biết đã bao nhiêu lần anh mơ được cùng em đi dưới con đường năm ấy, như thể chỉ cần được quay lại khoảnh khắc đó thôi, anh đã có thể gặp lại một phần rất đẹp của những ngày tháng cũ.'
          ]
        },
        {
          id: 'reflection',
          scene: 'quiet',
          alt: 'Tranh màu nước: con phố Đà Lạt vắng trong mưa nhẹ, đèn đường vàng dịu.',
          text: [
            'Nghĩ lại mới thấy, thế giới này thật lạ kỳ em nhỉ? Có những chuyện xảy ra rất nhỏ, rất khẽ, tưởng chừng chẳng có gì đáng để nhớ, vậy mà lại để lại trong lòng mình những dấu ấn thật sâu đậm, theo một cách rất đỗi dịu dàng.'
          ]
        }
      ]
    },

    ch2: {
      art: 'ch2',
      beats: [
        {
          id: 'near',
          scene: 'objects',
          alt: 'Tranh màu nước: trên chiếc bàn gỗ dưới nắng sáng có hai chiếc laptop gập, một chiếc mũ bảo hiểm và hai chiếc ly.',
          text: [
            'Anh vẫn nhớ những lúc hai đứa ở gần nhau, khi anh được nhìn em thật gần, được ôm em ngủ, và cả những ngày cứ thế trôi qua mà chẳng có gì đặc biệt. Vậy mà không hiểu sao, anh lại cảm thấy ấm áp và yên lòng hơn bao giờ hết.'
          ],
          hotspot: { x: 57, y: 72, label: 'Mũ bảo hiểm', icon: 'helmet' },
          hint: { text: 'Chạm vào chiếc mũ bảo hiểm nhé.' }
        },
        {
          id: 'ride',
          scene: 'ride',
          alt: 'Tranh màu nước: chiếc xe tay ga đỗ trước dãy nhà phố buổi sáng, một chiếc mũ bảo hiểm màu cam đất treo trên tay lái, một chiếc màu vàng mù tạt đặt trên yên.',
          text: [
            'Mỗi ngày, anh chở vợ đi làm rồi lại đón vợ về, với anh, đó cũng là một trải nghiệm rất vui. Dù đường có xa cỡ mấy, có kẹt xe cỡ mấy, nhưng chỉ cần đi cùng em thì mọi thứ dường như cũng hóa gần hơn.'
          ]
        },
        {
          id: 'quiz-worry',
          scene: 'ride',
          alt: 'Tranh màu nước: chiếc xe tay ga đỗ trước dãy nhà phố buổi sáng với hai chiếc mũ bảo hiểm.',
          text: [],
          interact: {
            type: 'quiz',
            question: 'Điều gì khiến mọi lo lắng trong lòng anh tan biến?',
            options: [
              { text: 'Được nghỉ học', reply: 'Nghỉ học thì vui thật, nhưng chưa đủ đâu.' },
              { text: 'Hết kẹt xe', reply: 'Kẹt xe thì có sao, có em ngồi sau là được.' },
              { text: 'Lương về', reply: 'Cũng vui đấy, nhưng vẫn chưa bằng.' },
              { text: 'Một giấc ngủ thật dài', reply: 'Ngủ dậy anh vẫn nhớ em thôi.' }
            ],
            answer: { text: 'Được nhìn thấy em tan làm', reply: 'Chuẩn luôn!' }
          }
        },
        {
          id: 'tired',
          scene: 'ride',
          alt: 'Tranh màu nước: chiếc xe tay ga đỗ trước dãy nhà phố với hai chiếc mũ bảo hiểm.',
          text: [
            'Anh có mệt không? Anh mệt chứ. Có những hôm anh chẳng nghĩ được gì cho bài vở, có những hôm bế tắc với công việc, nhưng hễ được nhìn thấy em tan làm, mọi lo lắng trong lòng anh dường như cũng phút chốc tan biến theo.'
          ],
          hotspot: { x: 88, y: 84, label: 'Hai chiếc ly', icon: 'cups' },
          hint: { text: 'Chạm vào hai chiếc ly nhé.' }
        },
        {
          id: 'cafe',
          scene: 'cafe',
          alt: 'Tranh màu nước: mặt bàn quán cà phê nhìn từ trên xuống, hai chiếc laptop mở cạnh nhau, hai ly cà phê đá, một chậu cây nhỏ và ba tờ giấy nhớ.',
          text: [
            'Có những hôm, hai đứa ngồi ở quán cà phê, mỗi người làm việc riêng của mình, nhưng vẫn ở ngay bên cạnh nhau. Anh thích nhìn em tập trung làm việc lắm. Mũi em cao, mắt em to, thi thoảng còn hơi nhăn nhăn nữa. Dù là lúc em có điệu bộ như thế nào, anh cũng đều thấy em thật đáng yêu.'
          ],
          interact: { type: 'taps', count: 3, points: [[15.5, 83.3], [35.5, 89.3], [73, 85.3]], label: 'Tờ giấy nhớ' },
          hint: { text: 'Chạm vào ba tờ giấy nhớ trên bàn nhé.' }
        },
        {
          id: 'lazy',
          scene: 'bedwork',
          alt: 'Tranh màu nước: buổi tối trong phòng ngủ, hai chiếc laptop mở sáng trên giường, phía sau là hai chiếc gối, đèn ngủ ấm bên cạnh.',
          text: [
            'Còn có những hôm, hai đứa mình lười lắm, mà phần lớn là như vậy thật, chỉ cần ngồi lại bên nhau rồi mỗi đứa lại tiếp tục làm việc của mình. Những lúc ấy, anh lại cảm nhận rõ hơn hơi ấm của em, cảm giác có em ở ngay bên cạnh mình.'
          ],
          hotspot: { x: 50, y: 83, label: 'Gập hai chiếc laptop', icon: 'laptops' },
          hint: { text: 'Chạm vào hai chiếc laptop để gập máy nhé.' }
        },
        {
          id: 'sleep',
          scene: 'sleep',
          alt: 'Tranh màu nước: đêm, hai chiếc laptop đã gập trên tủ đầu giường, hai chiếc gối sát nhau dưới tấm chăn, trăng ngoài cửa sổ, hai đôi dép dưới chân giường.',
          text: [
            'Anh thích nhất là những lúc em làm xong việc, rồi quay sang bảo anh đi ngủ với em. Chẳng cần làm gì đặc biệt, chỉ cần được nằm bên em như thế thôi, anh đã cảm thấy thật bình yên và hạnh phúc rồi.'
          ]
        },
        {
          id: 'care',
          scene: 'apart',
          photos: [PHOTOS.meal1],
          alt: 'Tranh màu nước: những vật quen thuộc trên bàn dưới ánh sáng xanh dịu.',
          text: [
            'Kể cả những lần chăm vợ ốm, nấu cơm cho vợ ăn, rồi lau người cho vợ nữa. Nhiều lúc, anh thấy mình đúng là một bảo mẫu thứ thiệt vậy.'
          ]
        },
        {
          id: 'cook',
          scene: 'apart',
          photos: [PHOTOS.meal2],
          alt: 'Tranh màu nước: những vật quen thuộc trên bàn dưới ánh sáng xanh dịu.',
          text: [
            'Mỗi món ăn anh nấu, anh đều mong em sẽ ăn ngon miệng, sẽ ăn thật nhiều. Mỗi lần như vậy, anh lại tự đặt mình vào một suy nghĩ: Nếu ngày mai anh phải xa vợ thì sao? Nếu đây là bữa cơm cuối cùng anh được nấu cho vợ trong một khoảng thời gian dài, thì anh muốn đó sẽ là bữa ăn ngon nhất, chỉn chu nhất mà anh có thể dành cho em.'
          ]
        },
        {
          id: 'quiz-food',
          scene: 'apart',
          photos: [PHOTOS.meal3],
          alt: 'Tranh màu nước: những vật quen thuộc trên bàn dưới ánh sáng xanh dịu.',
          text: [],
          interact: {
            type: 'quiz',
            question: 'Anh thích ăn món gì nhất?',
            options: [
              { text: 'Rau muống xào tỏi', reply: 'Ngon đấy, nhưng chưa phải món anh thích nhất.' },
              { text: 'Chả cá', reply: 'Gần đúng rồi… mà vẫn chưa phải.' },
              { text: 'Thịt bò xào', reply: 'Không phải đâu nha.' },
              { text: 'Bún bò', reply: 'Bún bò cũng chỉ đứng thứ hai thôi.' }
            ],
            answer: { text: 'Vợ', reply: 'Món anh thích nhất từ trước đến giờ.' }
          }
        },
        {
          id: 'cherish',
          scene: 'apart',
          alt: 'Tranh màu nước: những vật quen thuộc trên bàn — hai chiếc laptop, mũ bảo hiểm, hai chiếc ly — dưới ánh sáng xanh dịu.',
          text: [
            'Anh nghĩ yêu xa cũng là một cách dạy anh biết trân trọng vợ mình nhiều hơn nữa. Bởi vì khi không phải lúc nào cũng được ở bên em, anh mới càng hiểu những điều bình thường mình có thể làm cho em quý giá đến nhường nào.'
          ]
        },
        {
          id: 'sorry',
          scene: 'sleep',
          alt: 'Tranh màu nước: phòng ngủ ban đêm, hai chiếc gối sát nhau, dây đèn nhỏ sáng trên tường.',
          text: [
            'Nên vợ anh thông cảm cho anh nhé. Những lúc anh cứ lọ mọ làm này làm kia ở ngoài, mãi mà chưa vào với vợ, không phải vì anh không muốn ở bên em đâu. Anh chỉ muốn làm thêm một chút gì đó cho em thôi. Nhưng anh cũng sẽ nhớ rằng, điều vợ cần đôi khi chẳng phải là một điều gì lớn lao, mà chỉ đơn giản là có anh ở bên cạnh mình thôi, phải không vợ?'
          ]
        }
      ]
    },

    ch3: {
      art: 'ch3',
      beats: [
        {
          id: 'grownup',
          scene: 'grownup',
          alt: 'Tranh màu nước: phòng khách buổi tối, chiếc áo khoác và túi đồ đi làm treo trên móc cạnh cửa.',
          text: [
            'Nếu nói ở cạnh vợ là một cảm giác như thế nào, anh sẽ nói rằng ở cạnh vợ thoải mái lắm. Anh không phải lúc nào cũng cần tỏ ra mình là một người trưởng thành, cũng chẳng cần lúc nào cũng phải mạnh mẽ hay nghiêm túc. Ở bên em, anh có thể nhõng nhẽo một tí, trẻ con một tí, cũng chẳng sao cả. Vì anh biết rằng, khi ở cạnh vợ, anh có thể thoải mái là chính mình.'
          ],
          hotspot: { x: 50, y: 62, label: 'Vòng tay ôm', icon: 'hug' },
          hint: { text: 'Chạm vào vòng tay ôm nhé.' }
        },
        {
          id: 'belly',
          scene: 'hug',
          alt: 'Tranh màu nước: trên chiếc sofa, chiếc áo len nâu đỏ của vợ vòng hai tay áo ôm lấy chiếc áo len xanh than tròn bụng của anh.',
          text: [],
          interact: { type: 'taps', count: 5, points: [[55.5, 61]], label: 'Chiếc bụng mỡ' },
          hint: { text: 'Xoa chiếc bụng mỡ của anh vài cái xem nào.' }
        },
        {
          id: 'quiz-sixpack',
          scene: 'hug',
          alt: 'Tranh màu nước: chiếc áo len xanh than tròn bụng được chiếc áo len nâu đỏ ôm lấy, vài trái tim nhỏ bay lên.',
          text: [],
          interact: {
            type: 'quiz',
            question: 'Vậy anh có định tập lại 6 múi không?',
            options: [
              { text: 'Có, từ mai', reply: 'Mai rồi lại mai…' },
              { text: 'Từ tuần sau', reply: 'Tuần sau thì chắc lại là tuần sau nữa.' },
              { text: 'Sau Tết', reply: 'Tết xong lại ăn tiếp mất rồi.' },
              { text: 'Khi nào vợ bảo', reply: 'Gần đúng rồi đó… nhưng chưa phải đâu.' }
            ],
            answer: { text: 'Không cần, miễn là vợ vẫn yêu anh như thế này', reply: 'Đúng rồi, giữ nguyên cho vợ yêu.' }
          }
        },
        {
          id: 'sixpack',
          scene: 'hug',
          alt: 'Tranh màu nước: chiếc áo len xanh than tròn bụng được chiếc áo len nâu đỏ ôm lấy, vài trái tim nhỏ bay lên.',
          text: [
            'Anh thích những lần vợ mân mê anh lắm, nhất là những lúc vợ cứ mân mê cả cái bụng mỡ của anh nữa. Đến nỗi anh đã nghĩ, chắc cả đời này mình cũng chẳng cần phải tập để có lại 6 múi nữa đâu. Miễn là vợ vẫn yêu anh, vẫn thích anh như thế này, thì anh có hình dáng nào cũng được, anh đều có thể giữ nguyên như vậy cho vợ yêu.'
          ]
        },
        {
          id: 'love',
          scene: 'child',
          photos: [PHOTOS.cheek],
          alt: 'Tranh màu nước: góc sofa dưới ánh đèn ấm, hai chiếc gối tựa vào nhau.',
          text: [
            'Nhưng nếu nói về những điều khiến anh ấn tượng nhất, anh nghĩ vẫn là những lần em nói rằng em yêu anh nhất trên đời. Thật sự, anh cảm nhận được em thương anh rất nhiều. Em còn hay đùa rằng muốn cắn anh, muốn nuốt anh vào bụng nữa. Những lúc như thế, anh lại thấy mình được em cưng chiều đến nhường nào.'
          ]
        },
        {
          id: 'bites',
          scene: 'song',
          alt: 'Tranh màu nước: hai chiếc áo len ngồi cạnh nhau trên sofa; mỗi lần chạm, chiếc áo xanh than có thêm một dấu cắn hình trái tim.',
          text: [
            'Bây giờ thì anh chẳng còn được thấy những vết bầm do em cắn trên người mình nữa rồi. Nghĩ lại cũng thấy nhớ ghê. Chắc lúc về, anh phải cho vợ anh cắn nhiều hơn mới được, để vợ thỏa thích cưng anh, còn anh thì lại được cảm nhận cái cảm giác thân thuộc ấy một lần nữa.'
          ],
          interact: { type: 'taps', count: 4, points: [[61, 62]], label: 'Cắn anh một cái' },
          hint: { text: 'Chạm để cắn anh một cái nhé.' }
        }
      ]
    },

    ch4: {
      art: 'ch4',
      beats: [
        {
          id: 'lookback',
          scene: 'homes',
          alt: 'Tranh màu nước: bản đồ với hai ngôi nhà sáng đèn, một ở Việt Nam, một ở Đài Loan, nối với nhau bằng một đường bay chấm.',
          text: [
            'Nhìn lại hành trình mà cả hai đã đi qua, anh thấy hai đứa mình thật phi thường đấy vợ ạ.',
            'Không biết đã bao nhiêu lần anh tự hỏi, liệu vợ có thật sự cần anh không? Vợ anh xinh đẹp, giỏi giang, còn anh thì ở xa ơi là xa, đến việc muốn chăm sóc vợ thôi cũng đã khó khăn rồi. Vì vậy, với anh, việc vợ yêu anh luôn là một sự lựa chọn. Yêu anh mỗi ngày, quan tâm anh mỗi ngày, và ngày nào cũng chọn anh là người để vợ chia sẻ, để vợ thương yêu. Anh biết rằng để làm được những điều ấy, vợ cũng đã cố gắng rất nhiều.'
          ]
        },
        {
          id: 'choose',
          scene: 'homes',
          alt: 'Tranh màu nước: bản đồ với hai ngôi nhà sáng đèn nối với nhau bằng một đường bay chấm.',
          text: [],
          interact: {
            type: 'quiz',
            all: true,
            question: 'Hôm nay vợ vẫn chọn anh chứ?',
            options: [{ text: 'Có' }, { text: 'Tất nhiên là có' }],
            reply: 'Anh biết mà.'
          }
        },
        {
          id: 'worthy',
          scene: 'homes',
          alt: 'Tranh màu nước: bản đồ với hai ngôi nhà sáng đèn nối với nhau bằng một đường bay chấm.',
          text: [
            'Đã có lúc anh nghĩ, chắc vợ sẽ bỏ anh sớm thôi. Nhưng bây giờ, anh đã nghĩ khác rồi. Anh không còn chỉ lo lắng về việc liệu một ngày nào đó vợ có rời xa anh hay không, mà anh bắt đầu nghĩ mình phải làm thế nào để trở thành một người xứng đáng với tình yêu, sự lựa chọn và cả những tháng ngày chờ đợi của vợ.'
          ],
          hotspot: { x: 26.8, y: 53.4, label: 'Điểm sáng trên đường bay', icon: 'spark' },
          hint: { text: 'Chạm vào điểm sáng nhé.' }
        },
        {
          id: 'meet',
          scene: 'meet',
          alt: 'Tranh màu nước: trên bản đồ có ba con tem kỷ niệm — máy bay, mũ tốt nghiệp, núi Phú Sĩ — lần lượt sáng lên khi chạm vào.',
          text: [
            'Giữa những ngày xa nhau, chúng mình vẫn có những lần được gặp lại. Có chuyến vợ đến thăm anh, cũng có chuyến anh quay về để tham dự lễ tốt nghiệp của vợ. Rồi sau này còn có cả chuyến đi Nhật Bản của hai đứa mình nữa.'
          ],
          interact: { type: 'taps', count: 3, points: [[63, 88.7], [76.5, 88.7], [90, 88.7]], label: 'Con tem kỷ niệm', icon: 'spark' },
          hint: { text: 'Chạm vào từng con tem nhé.' }
        },
        {
          id: 'motivation',
          scene: 'meet',
          photos: [PHOTOS.reunion, PHOTOS.kimono, PHOTOS.busStop],
          alt: 'Tranh màu nước: bản đồ với ba con tem kỷ niệm đã sáng.',
          text: [
            'Mỗi lần được gặp vợ, anh lại càng có thêm động lực để cố gắng.'
          ]
        },
        {
          id: 'europe',
          scene: 'dream',
          alt: 'Tranh màu nước: bên cạnh ba con tem kỷ niệm, một con tem viền nét đứt hình tháp Eiffel ghi "châu Âu" — chuyến đi anh mong.',
          text: [
            'Anh cứ nghĩ mãi về những nơi mình muốn đưa vợ đến, những trải nghiệm mình muốn cùng vợ tận hưởng. Anh mong một ngày nào đó có thể đưa vợ đi châu Âu, đi bất cứ nơi nào vợ thích, và có đủ khả năng để mua cho vợ bất cứ thứ gì vợ muốn. Không phải vì anh nghĩ những điều ấy mới có thể làm vợ hạnh phúc, mà vì anh muốn tình yêu của mình không chỉ nằm trong những lời hứa, mà còn có thể trở thành những điều cụ thể để vợ được trải nghiệm, được vui vẻ và được sống với những gì vợ mong muốn.'
          ]
        },
        {
          id: 'storm',
          scene: 'hard',
          alt: 'Tranh màu nước: một đám mây giông xám lơ lửng giữa hai ngôi nhà, ánh đèn dịu đi.',
          text: [
            'Hành trình của chúng mình có những ngày nắng, nhưng cũng chẳng thiếu những ngày mưa. Hai đứa yêu nhau nhiều thật đấy, nhưng cãi nhau cũng nhiều không kém.',
            'Mỗi lần cãi nhau, đến khi hai đứa dập điện thoại, anh lại chẳng thể nào yên lòng được. Với anh, chỉ cần hai đứa có chuyện gì không vui, dường như mọi thứ khác trong ngày cũng trở nên khó khăn hơn. Anh biết vợ mình nóng tính, nhưng đứng trước những mớ bòng bong của cảm xúc và những điều chưa thể giải quyết, lòng anh cũng rối bời chẳng kém.'
          ]
        },
        {
          id: 'clouds',
          scene: 'hard',
          alt: 'Tranh màu nước: đám mây giông giữa hai ngôi nhà; mỗi lần chạm, mây tan bớt.',
          text: [
            'Nhiều lúc, anh chẳng biết phải làm gì mới đúng, nói thế nào mới phải. Anh chỉ biết rằng mình không muốn làm điều gì khiến em phải suy nghĩ, phải buồn lòng thêm nữa. Anh muốn mọi chuyện giữa hai đứa được ổn thỏa, muốn vợ vui vẻ trở lại, muốn chúng mình lại có thể nói chuyện với nhau bình thường. Có lẽ vì thương vợ nhiều quá, nên những lúc như vậy, anh cũng dễ trở nên luống cuống và chẳng biết phải làm sao.'
          ],
          interact: { type: 'taps', count: 5, points: [[30.5, 50]], label: 'Đám mây' },
          hint: { text: 'Chạm vào đám mây để thổi nó đi nhé.' }
        },
        {
          id: 'still',
          scene: 'learn',
          alt: 'Tranh màu nước: mây đã tan, hai ngôi nhà sáng đèn trở lại.',
          text: [
            'Tuy nhiên, dẫu có những ngày vui vẻ hay những lúc chẳng thể hiểu nhau, cuối cùng hai đứa mình vẫn thương nhau đủ nhiều để cùng nhau đi tiếp. Chúng mình vẫn ở đây, vẫn lựa chọn nhau, vẫn cố gắng tìm cách để hiểu nhau hơn sau mỗi lần không vui.'
          ]
        },
        {
          id: 'quiz-extraordinary',
          scene: 'learn',
          alt: 'Tranh màu nước: hai ngôi nhà sáng đèn trên bản đồ, trời đã quang.',
          text: [],
          interact: {
            type: 'quiz',
            question: 'Theo anh, điều phi thường nhất của chúng mình là gì?',
            options: [
              { text: 'Yêu nhau thật nhiều', reply: 'Nhiều thật, nhưng chưa phải điều phi thường nhất.' },
              { text: 'Cãi nhau cũng nhiều không kém', reply: 'Cái này thì… cũng phi thường thật.' },
              { text: 'Bay đi bay về', reply: 'Cũng phi thường đấy, nhưng chưa phải đâu.' },
              { text: 'Chịu được tính nóng của vợ', reply: 'Câu này anh không dám trả lời đâu.' }
            ],
            answer: { text: 'Sau tất cả, vẫn muốn dành cho nhau một cơ hội để cùng cố gắng', reply: 'Đúng rồi đó vợ.' }
          }
        },
        {
          id: 'extraordinary',
          scene: 'learn',
          alt: 'Tranh màu nước: hai ngôi nhà sáng đèn trên bản đồ, trời đã quang.',
          text: [
            'Anh nghĩ, điều phi thường nhất của chúng mình có lẽ không phải là đã yêu nhau nhiều đến thế nào, mà là sau tất cả những khó khăn, những lần giận hờn và cả những lúc chẳng biết phải làm sao, hai đứa vẫn muốn dành cho nhau một cơ hội để cùng cố gắng.'
          ]
        },
        {
          id: 'hold-hands',
          scene: 'future',
          alt: 'Tranh màu nước: từ hai ngôi nhà, hai con đường vàng dần vươn ra và nhập làm một, hướng về phía ánh bình minh.',
          text: [],
          interact: { type: 'hold', label: 'Giữ để nắm tay nhau', ms: 2000 },
          hint: { text: 'Nhấn và giữ nút bên dưới nhé.' }
        },
        {
          id: 'future',
          scene: 'future',
          photos: [PHOTOS.feet],
          alt: 'Tranh màu nước: từ hai ngôi nhà, hai con đường vàng nhập làm một, hướng về phía ánh bình minh.',
          text: [
            'Và anh cũng vậy, vợ ạ. Anh vẫn muốn là người được vợ lựa chọn, nhưng hơn hết, anh muốn mình trở thành người mà vợ có thể yên tâm lựa chọn mỗi ngày. Để sau này, khi nhìn lại hành trình đã qua, cả hai đứa mình đều có thể mỉm cười và nói rằng: May quá, ngày ấy chúng mình đã không buông tay nhau.'
          ]
        }
      ]
    }
  };

  const ui = {
    // Câu chữ chung của câu đố và tương tác trong chương (theo bản thiết kế anh đã duyệt).
    play: {
      wrong: 'Chưa đúng rồi, vợ đoán lại xem nào.',
      submit: 'Trả lời',
      reveal: 'Xem đáp án',
      tapsLeft: 'Còn {n} lần nữa',
      holdDone: 'Xong rồi!'
    },
    dedication: 'Tặng vợ · 20/10',
    // ĐÃ DUYỆT Câu giới thiệu ngắn dưới tên game.
    tagline: { text: 'Một câu chuyện nhỏ về hai chúng mình.' },

    start: {
      begin: 'Bắt đầu',
      resume: 'Tiếp tục câu chuyện',
      memories: 'Xem lại kỷ niệm',
      restart: 'Bắt đầu lại từ đầu'
    },
    nav: {
      back: 'Quay lại',
      home: 'Trang đầu'
    },
    memories: {
      heading: 'Xem lại kỷ niệm',
      intro: 'Những phần đã mở có thể xem lại bất cứ lúc nào. Xem lại không làm thay đổi tiến trình.',
      unlocked: 'Đã mở',
      locked: 'Chưa mở',
      openMap: 'Bản đồ hành trình'
    },
    letter: {
      continue: 'Tiếp tục',
      // ĐÃ DUYỆT — nút chỉ hiện khi xem lại, để đọc nhanh cả lá thư.
      showAll: { text: 'Hiện cả lá thư' },
      // Mô tả hình cho trình đọc màn hình (không hiển thị).
      sceneAlt: 'Tranh màu nước: một lá thư gấp trong phong bì trên chiếc bàn gỗ cạnh cửa sổ, nắng sáng chiếu vào.',
      sceneAltOpen: 'Tranh màu nước: phong bì trên bàn gỗ đã mở, lá thư được rút ra dưới nắng sáng.'
    },
    map: {
      heading: 'Bản đồ hành trình',
      // ĐÃ DUYỆT
      hint: { text: 'Mình cùng đi qua từng kỷ niệm nhé.' },
      // ĐÃ DUYỆT — thông báo khi chạm vào chương chưa mở.
      lockedNotice: { text: 'Kỷ niệm này, mình sẽ cùng nhau khám phá sau nhé.' },
      // Nhãn trạng thái từng điểm (luôn có chữ, không chỉ dựa vào màu).
      status: {
        visited:  { text: 'Đã đi qua' },            // ĐÃ DUYỆT
        // ĐÃ DUYỆT Chương đã mở nhưng chưa đọc xong (vd đang đọc dở Chương 1).
        unlocked: { text: 'Đã mở' },
        next:     { text: 'Chặng tiếp theo' },      // ĐÃ DUYỆT
        locked:   { text: 'Chưa mở' }               // ĐÃ DUYỆT
      },
      mapAlt: 'Bản đồ màu nước với con đường nối Mở đầu và năm chương của câu chuyện.'
    },
    chapter: {
      continue: 'Tiếp tục',
      toMap: 'Về bản đồ',
      replayBadge: 'Đang xem lại',
      placeholder: 'Khung tạm – nội dung phần này sẽ được thêm ở Bước {step}.',
      notUnlocked: 'Phần này chưa được mở.'
    },
    restartDialog: {
      title: 'Bắt đầu lại từ đầu?',
      body: 'Tiến trình đã lưu trên máy này sẽ được xóa. Câu chuyện sẽ mở lại từ trang đầu tiên.',
      confirm: 'Bắt đầu lại',
      cancel: 'Thôi, giữ lại'
    },
    // Nút âm thanh trên thanh trên cùng: chỉ hiện khi có tệp nhạc nền (js/content/music-config.js).
    sound: {
      on: 'Âm thanh: bật',
      off: 'Âm thanh: tắt'
    },
    // Nhãn của khung nhạc ở góc màn hình, và chữ hiện khi rê chuột lên nút âm thanh ("Nhạc nền: <tên bài>").
    music: {
      credit: 'Nhạc nền'
    },
    storage: {
      corrupt: 'Không đọc được tiến trình cũ nên câu chuyện bắt đầu lại từ đầu.',
      unavailable: 'Trình duyệt này không cho lưu tiến trình. Câu chuyện vẫn xem được bình thường.'
    },
    errors: {
      navigation: 'Có lỗi nhỏ khi chuyển trang. Thử lại nhé.'
    }
  };

  function getChapter(id) {
    return chapters.find((c) => c.id === id) || null;
  }

  function chapterIds() {
    return chapters.map((c) => c.id);
  }

  function nextChapter(id) {
    const i = chapters.findIndex((c) => c.id === id);
    return i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : null;
  }

  // Màn hình dùng để hiển thị một chương.
  function screenFor(id) {
    const c = getChapter(id);
    return (c && c.screen) || 'chapter';
  }

  function prevChapter(id) {
    const i = chapters.findIndex((c) => c.id === id);
    return i > 0 ? chapters[i - 1] : null;
  }

  // Thay {key} trong chuỗi bằng giá trị tương ứng.
  function format(template, values) {
    return String(template).replace(/\{(\w+)\}/g, (m, k) => (values && k in values ? values[k] : m));
  }

  NNBT.story = Object.freeze({
    title,
    chapters: Object.freeze(chapters.map((c) => Object.freeze(c))),
    letter: Object.freeze(letter),
    chapterContent,
    finale,
    photos: PHOTOS,
    ui,
    getChapter,
    chapterIds,
    screenFor,
    nextChapter,
    prevChapter,
    format
  });
})(window.NNBT);
