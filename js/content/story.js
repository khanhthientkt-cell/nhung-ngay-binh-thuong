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
  // ĐÃ CHỐT (nguyên văn): 4 lựa chọn chuyến đi (3 lựa chọn đầu), lời cuối, dòng kết thúc.
  // Mọi câu chữ khác ĐÃ DUYỆT.
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
          alt: 'bầu trời đêm đầy sao với dải cực quang xanh, hai người ngồi cạnh nhau trên đồi tuyết, nhìn từ phía sau'
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
    // ĐÃ CHỐT — nguyên văn lời cuối
    letter: {
      approved: true,
      paragraphs: [
        'Vợ à,',
        'Cảm ơn vợ vì đã xuất hiện trong cuộc đời anh, vì đã cho anh biết cảm giác được yêu thương theo một cách rất riêng, được làm một đứa trẻ khi ở cạnh một người mà mình tin tưởng, và được có những ngày bình thường nhưng sau này nhớ lại vẫn thấy quý giá đến vậy.',
        'Anh không biết câu chuyện của chúng mình sẽ còn dài đến đâu, sẽ có thêm bao nhiêu chuyến đi, bao nhiêu lần gặp lại, hay còn phải học thêm những điều gì để hiểu nhau hơn.',
        'Nhưng anh vẫn muốn tiếp tục viết câu chuyện ấy cùng em.',
        'Anh mong một ngày nào đó, khi không còn phải đếm ngày đến lúc gặp nhau, chúng mình lại có thể cùng đi làm, cùng ngồi ở một quán cà phê, cùng trở về nhà, làm nốt những việc còn dang dở rồi ôm nhau ngủ.',
        'Và rồi ngày hôm sau, mình lại có thêm một ngày bình thường nữa.',
        'Có lẽ anh sẽ còn muốn đưa em đi thật nhiều nơi, thực hiện những dự định của hai đứa và cùng em nhìn ngắm thế giới rộng lớn này. Nhưng dù đi đến đâu, anh vẫn mong điều mình có thể giữ lại là cảm giác được ở cạnh em, được chăm sóc em và được cùng em xây dựng cuộc sống của chúng mình.',
        'Chúc vợ ngày 20/10 thật vui vẻ, luôn mạnh khỏe và được yêu thương thật nhiều.',
        'Anh yêu vợ.',
        'Và anh vẫn mong được cùng vợ viết tiếp những ngày bình thường của chúng mình.'
      ]
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
  // Mỗi nhịp (beat):
  //   id       — tên nhịp (dùng để ghi "đã xem")
  //   scene    — lớp minh họa được hiện (xem js/art/)
  //   alt      — mô tả tranh cho trình đọc màn hình
  //   text     — các đoạn chữ hiện ở nhịp này
  //   approved — nguyên văn đã duyệt, KHÔNG sửa | draft — [NHÁP – cần duyệt]
  //   hotspot  — (tùy chọn) vật có thể chạm trong tranh để sang nhịp sau; x, y tính theo % khung tranh
  //   hint     — (tùy chọn) câu gợi ý nhỏ dưới chữ
  //   alternatives — (tùy chọn) phương án lời kể khác đang chờ duyệt; chỉ hiện ở chế độ duyệt (#debug),
  //              người chơi không bao giờ thấy
  const chapterContent = {
    ch1: {
      art: 'ch1',
      beats: [
        {
          id: 'intro',
          scene: 'road',
          approved: true,
          alt: 'Tranh màu nước: con phố Đà Lạt ướt mưa, đồi thông mờ sương phía xa, một cột đèn vàng.',
          text: [
            'Em còn nhớ chuyến đi tình nguyện ở Đà Lạt của chúng mình không?',
            'Hồi đó, hai đứa mình còn chưa nói chuyện với nhau nhiều. Anh cũng chẳng biết sau này chúng mình sẽ có thể đi xa đến như vậy...',
            'Có một chuyện nhỏ trong chuyến đi ấy mà anh vẫn nhớ đến tận bây giờ.'
          ]
        },
        {
          id: 'rain',
          scene: 'walk',
          approved: true,
          alt: 'Tranh màu nước: ba người đi cùng nhau dưới mưa trên con phố Đà Lạt, nhìn từ phía sau; ở bên trái, một người đứng nhìn theo.',
          text: [
            'Hôm đó, anh thấy em với chị Liên đang đi cùng anh Tâm dưới trời mưa mà anh Tâm lại không có ô.'
          ],
          // Nút tròn có biểu tượng chiếc ô, đặt cạnh nhân vật anh (là nút giao diện, không phải vật trong cảnh).
          hotspot: { x: 27, y: 62, label: 'Chiếc ô', icon: 'umbrella' },
          hint: { text: 'Chạm vào chiếc ô để đi tiếp nhé.' }   // ĐÃ DUYỆT
        },
        {
          id: 'umbrella',
          scene: 'return',
          approved: true,
          alt: 'Tranh màu nước: người đứng bên trái giờ cầm ô chạy ra mưa, về phía ba người đang đi.',
          text: [
            'Anh không nhớ lúc ấy mình đã nghĩ gì nhiều đâu. Chỉ nhớ là anh quay lại lấy ô, rồi chạy trở ra để đi cùng mọi người.'
          ]
        },
        {
          id: 'reflection',
          scene: 'quiet',
          approved: true,   // ĐÃ DUYỆT — đoạn suy ngẫm cuối chương
          alt: 'Tranh màu nước: con phố Đà Lạt vắng trong mưa nhẹ, đèn đường vàng dịu.',
          text: [
            'Có những chuyện rất nhỏ, lúc xảy ra chẳng có vẻ gì đặc biệt. Vậy mà rất lâu sau, khi nhìn lại, anh mới thấy chúng đáng nhớ đến thế nào.'
          ]
        }
      ]
    },

    // Chương 2 — toàn bộ lời kể và gợi ý ĐÃ DUYỆT.
    // Chỉ diễn đạt lại 5 ý trong bản mô tả: chở đi làm / đón về mỗi ngày; ngồi quán cà phê, mỗi người làm việc riêng
    // bên cạnh nhau; về nhà tiếp tục làm việc trên giường; xong việc ôm nhau rồi ngủ; những điều bình thường giờ là
    // những điều anh nhớ nhất. Không có lời thoại, không thêm sự kiện.
    ch2: {
      art: 'ch2',
      beats: [
        {
          id: 'objects',
          scene: 'objects',
          alt: 'Tranh màu nước: trên chiếc bàn gỗ dưới nắng sáng có hai chiếc laptop gập, một chiếc mũ bảo hiểm và hai chiếc ly.',
          text: [
            'Hồi hai đứa mình còn ở gần nhau, có rất nhiều ngày trôi qua mà chẳng có gì đặc biệt.'
          ],
          hotspot: { x: 57, y: 47, label: 'Mũ bảo hiểm', icon: 'helmet' },
          hint: { text: 'Chạm vào chiếc mũ bảo hiểm nhé.' }
        },
        {
          id: 'ride',
          scene: 'ride',
          alt: 'Tranh màu nước: anh chở vợ trên xe máy qua con phố buổi sáng, cả hai đội mũ bảo hiểm.',
          text: [
            'Mỗi ngày, anh chở vợ đi làm, rồi lại đón vợ về.'
          ],
          hotspot: { x: 88, y: 84, label: 'Hai chiếc ly', icon: 'cups' },
          hint: { text: 'Chạm vào hai chiếc ly nhé.' }
        },
        {
          id: 'cafe',
          scene: 'cafe',
          alt: 'Tranh màu nước: hai người ngồi cạnh nhau trong quán cà phê, nhìn từ phía sau, mỗi người một chiếc laptop, trên bàn có hai chiếc ly.',
          text: [
            'Có những hôm, hai đứa ngồi ở quán cà phê, mỗi người làm việc riêng của mình, ngay bên cạnh nhau.'
          ],
          hotspot: { x: 88, y: 18, label: 'Chiếc giường', icon: 'bed' },
          hint: { text: 'Chạm vào chiếc giường nhé.' }
        },
        {
          id: 'bedwork',
          scene: 'bedwork',
          alt: 'Tranh màu nước: buổi tối trong phòng ngủ, hai người ngồi trên giường, mỗi người một chiếc laptop mở trên đùi.',
          text: [
            'Về đến nhà, cả hai lại tiếp tục làm việc trên giường.'
          ],
          hotspot: { x: 88, y: 18, label: 'Gập hai chiếc laptop', icon: 'laptops' },
          hint: { text: 'Chạm vào hai chiếc laptop để gập máy nhé.' }
        },
        {
          id: 'sleep',
          scene: 'sleep',
          alt: 'Tranh màu nước: đêm, hai chiếc laptop đã gập trên tủ đầu giường, hai người ôm nhau ngủ dưới tấm chăn.',
          text: [
            'Khi xong việc, hai đứa ôm nhau rồi ngủ.'
          ]
        },
        {
          id: 'apart',
          scene: 'apart',
          alt: 'Tranh màu nước: lại những vật quen thuộc trên bàn — hai chiếc laptop, mũ bảo hiểm, hai chiếc ly — dưới ánh sáng xanh dịu.',
          // ĐÃ CHỐT — lời kể chính thức của nhịp cuối.
          text: [
            'Hồi đó, những điều ấy bình thường lắm.',
            'Vậy mà bây giờ, khi hai đứa ở xa nhau, đó lại là những điều anh nhớ nhất.'
          ],
          // Phương án thay thế KHÔNG dùng (đã chốt lời kể chính ở trên) — không hiển thị cho người chơi,
          // chỉ hiện bên dưới lời kể chính khi mở chế độ duyệt (#debug). Chưa chọn phương án nào làm bản cuối.
          alternatives: [
            {
              text: [
                'Hồi đó, anh đâu nghĩ mình sẽ nhớ những điều bình thường ấy nhiều đến vậy. Đến khi hai đứa ở xa nhau, anh mới nhận ra mình nhớ cả những ngày chẳng có gì đặc biệt ấy.'
              ]
            }
          ]
        }
      ]
    },

    // Chương 3 — toàn bộ lời kể và gợi ý ĐÃ DUYỆT.
    // Chỉ diễn đạt lại 5 ý trong bản mô tả: không phải lúc nào cũng cần tỏ ra người trưởng thành khi ở cạnh vợ;
    // vợ ôm chiếc "bụng mỡ" của anh; vợ nghêu ngao hát và trêu rằng muốn cắn, nuốt anh vào bụng (kể gián tiếp,
    // không trích lời); được cưng chiều như một đứa trẻ và cảm nhận cách yêu rất riêng của vợ; nhớ những cái ôm,
    // giọng hát và sự nghịch ngợm ấy khi xa nhau. Không viết lời bài hát, không thêm hành động hay lời thoại.
    ch3: {
      art: 'ch3',
      beats: [
        {
          id: 'grownup',
          scene: 'grownup',
          alt: 'Tranh màu nước: phòng khách buổi tối, chiếc áo khoác và túi đồ đi làm treo trên móc cạnh cửa.',
          text: [
            'Ở cạnh vợ, anh không phải lúc nào cũng cần tỏ ra là một người trưởng thành.'
          ],
          hotspot: { x: 72, y: 60, label: 'Vòng tay ôm', icon: 'hug' },
          hint: { text: 'Chạm vào vòng tay ôm nhé.' }
        },
        {
          id: 'hug',
          scene: 'hug',
          alt: 'Tranh màu nước: nhìn nghiêng, vợ đứng phía sau, vòng tay ôm lấy chiếc bụng tròn của anh.',
          text: [
            'Vợ ôm lấy chiếc “bụng mỡ” của anh.'
          ],
          hotspot: { x: 80, y: 22, label: 'Nốt nhạc', icon: 'song' },
          hint: { text: 'Chạm vào nốt nhạc nhé.' }
        },
        {
          id: 'song',
          scene: 'song',
          alt: 'Tranh màu nước: vợ nghêu ngao hát, vài nốt nhạc bay lên; anh đứng cạnh.',
          text: [
            'Vợ nghêu ngao hát, rồi trêu là muốn cắn anh, nuốt anh vào bụng.'
          ]
        },
        {
          id: 'child',
          scene: 'child',
          alt: 'Tranh màu nước: hai người ngồi sát cạnh nhau trên chiếc sofa dưới ánh đèn ấm, nhìn từ phía sau.',
          text: [
            'Những lúc ấy, anh thấy mình được cưng chiều như một đứa trẻ.',
            'Và anh cảm nhận được, đó là cách yêu thương rất riêng mà vợ dành cho anh.'
          ]
        },
        {
          id: 'miss',
          scene: 'miss',
          alt: 'Tranh màu nước: chiếc sofa trống dưới ánh sáng xanh dịu, vài nốt nhạc mờ.',
          text: [
            'Bây giờ ở xa, anh nhớ những cái ôm ấy, nhớ giọng hát và cả sự nghịch ngợm của vợ.'
          ]
        }
      ]
    },

    // Chương 4 — câu cốt lõi ở nhịp cuối là NGUYÊN VĂN ĐÃ CHỐT. Mọi lời kể khác ĐÃ DUYỆT.
    // Bám đúng các ý trong bản mô tả, KHÔNG thêm chi tiết chưa xác nhận:
    //   - không nói ai sống ở Việt Nam, ai ở Đài Loan;
    //   - không nói lễ tốt nghiệp ở đâu, ai về; không nói lần chăm ốm ở đâu; không kể chi tiết chuyến đi Nhật;
    //   - phần bất đồng: không kể chi tiết, không quy lỗi, không thành lời xin lỗi dài.
    ch4: {
      art: 'ch4',
      beats: [
        {
          id: 'homes',
          scene: 'homes',
          alt: 'Tranh màu nước: bản đồ giản lược với hai ngôi nhà sáng đèn, một ở Việt Nam, một ở Đài Loan, nối với nhau bằng một đường bay chấm.',
          text: [
            'Bây giờ, hai đứa mình ở hai nơi: một ngôi nhà sáng đèn ở Việt Nam, một ngôi nhà sáng đèn ở Đài Loan.',
            'Hai nơi, nhưng vẫn là cùng một câu chuyện.'
          ],
          hotspot: { x: 53, y: 24, label: 'Điểm sáng trên đường bay', icon: 'spark' },
          hint: { text: 'Chạm vào điểm sáng nhé.' }
        },
        {
          id: 'graduation',
          scene: 'graduation',
          alt: 'Tranh màu nước: trên bản đồ, con tem đầu tiên sáng lên với hình chiếc mũ tốt nghiệp.',
          text: [
            'Giữa những ngày xa nhau, vẫn có những lần mình gặp lại.',
            'Có chuyến trở về dự lễ tốt nghiệp của vợ.'
          ],
          hotspot: { x: 70.5, y: 87, label: 'Điểm sáng: kỷ niệm tiếp theo', icon: 'spark' },
          hint: { text: 'Chạm vào điểm sáng nhé.' }
        },
        {
          id: 'flight',
          scene: 'flight',
          alt: 'Tranh màu nước: con tem thứ hai sáng lên với hình chiếc máy bay.',
          text: [
            'Có lần anh đổi kế hoạch chuyến bay để chăm vợ khi vợ bị bệnh.'
          ],
          hotspot: { x: 85.5, y: 87, label: 'Điểm sáng: kỷ niệm tiếp theo', icon: 'spark' },
          hint: { text: 'Chạm vào điểm sáng nhé.' }
        },
        {
          id: 'japan',
          scene: 'japan',
          alt: 'Tranh màu nước: con tem thứ ba sáng lên với hình núi Phú Sĩ; trên bản đồ, Nhật Bản sáng nhẹ.',
          text: [
            'Và có chuyến đi Nhật Bản của hai đứa mình.'
          ]
        },
        {
          id: 'hard',
          scene: 'hard',
          alt: 'Tranh màu nước: một đám mây xám lơ lửng giữa hai ngôi nhà, ánh đèn dịu đi.',
          text: [
            'Cũng có những lúc hai đứa bất đồng, làm nhau buồn, hay chưa biết cách lắng nghe nhau.'
          ]
        },
        {
          id: 'learn',
          scene: 'learn',
          alt: 'Tranh màu nước: đám mây tan dần, hai ngôi nhà sáng đèn trở lại.',
          text: [
            'Nhưng cả hai vẫn muốn học cách hiểu nhau hơn.'
          ],
          hotspot: { x: 59, y: 65, label: 'Con đường phía trước', icon: 'road' },
          hint: { text: 'Chạm vào con đường nhé.' }
        },
        {
          id: 'future',
          scene: 'future',
          approved: true,   // ĐÃ CHỐT — câu cốt lõi của Chương 4, giữ nguyên văn
          alt: 'Tranh màu nước: từ hai ngôi nhà, hai con đường vàng nhập làm một, hướng về phía ánh bình minh.',
          text: [
            'Em chính là người mà anh đã lựa chọn, và anh muốn tiếp tục cùng em xây dựng tương lai, kể cả khi chúng ta vẫn còn nhiều điều phải học.'
          ]
        }
      ]
    }
  };

  const ui = {
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
    // Nút âm thanh đang ẩn vì dự án chưa có âm thanh (SOUND_AVAILABLE trong js/main.js).
    sound: {
      on: 'Âm thanh: bật',
      off: 'Âm thanh: tắt'
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
    ui,
    getChapter,
    chapterIds,
    screenFor,
    nextChapter,
    prevChapter,
    format
  });
})(window.NNBT);
