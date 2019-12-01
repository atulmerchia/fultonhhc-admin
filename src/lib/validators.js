const array_test = x => { try { x = x(); return Array.isArray(x) && x.length ? x : false; } catch(e) { console.log(e);return false; } }
const non_empty_string_test = x => (x = x.trim()).length ? x : false

module.exports = {
  about: {
    people: x => non_empty_string_test(x) ? x.split(',') : [],
    cover_photo: non_empty_string_test
  },
  contact: {
    name: non_empty_string_test,
    phone: x => { x = parseInt(`${x}`.replace(/\D/g, "")); return isNaN(x) ? false : x },
    email: non_empty_string_test
  },
  home: {
    title: non_empty_string_test,
    subtitle: non_empty_string_test,
    cover_images: array_test,
    text: x => x()
  },
  impact: {
    title: non_empty_string_test,
    img_urls: array_test,
    description: x => x()
  },
  meta: {
    calendar_id: non_empty_string_test,
    purchase_order_email: non_empty_string_test,
    social_media: {
      profile_fb: non_empty_string_test,
      profile_ig: non_empty_string_test,
      profile_tw: non_empty_string_test
    }
  },
  partner: {
    org: non_empty_string_test,
    website: x => x.trim(),
    img_url: x => x.trim(),
    people: x => array_test(x) ? x : [],
  },
  product: {
    name: non_empty_string_test,
    price: x => isNaN(x) ? false : x * 100,
    details: x => x.trim(),
    img_url: x => x.trim()
  }
}
