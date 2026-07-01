/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BowlConfig, NatsumeConfig, Customer } from '../types';

export const BOWLS: BowlConfig[] = [
  {
    id: 'KURO_RAKU',
    name: '黒楽茶碗 (くろらく)',
    description: '伝統的で重厚な漆黒の土肌。抹茶の薄緑色が最も際立つ、利休ゆかりの最高級碗です。',
    color: '#1a1a1a',
    bgColor: '#1c1c1c',
    borderColor: '#423d38',
    pattern: 'raku'
  },
  {
    id: 'SHINO',
    name: '志野茶碗 (しの)',
    description: 'ぽってりとした温かみのある白釉と、かすかな緋色。貫入（細かなひび）が美しい名作です。',
    color: '#f5f0eb',
    bgColor: '#efe9e2',
    borderColor: '#cca885',
    pattern: 'shino'
  },
  {
    id: 'GLASS',
    name: '義山茶碗 (ぎやまん)',
    description: '涼しげなカットガラス。夏の暑いお茶席で、五感に涼を届けるための現代的なお茶碗です。',
    color: '#e2f3f5',
    bgColor: 'rgba(226, 243, 245, 0.45)',
    borderColor: '#a3d2ca',
    pattern: 'glass'
  }
];

export const NATSUMES: NatsumeConfig[] = [
  {
    id: 'KIN_MAKIE',
    name: '黒漆金蒔絵棗',
    description: '艶やかな黒漆塗りに、金粉で美しい松竹梅が手描きされた伝統的で豪華絢爛な薄茶器。',
    color: '#0d0d0d',
    accentColor: '#e5c158'
  },
  {
    id: '溜塗_TAMUNURI',
    name: '溜塗棗 (ためぬり)',
    description: '透き通るような朱色の下地の上に、黒漆を薄く塗り重ねた、深みと落ち着きのある漆器。',
    color: '#3d0c0c',
    accentColor: '#9c1c1c'
  },
  {
    id: 'SHIRO_URUSHI',
    name: '白漆和モダン棗',
    description: '乳白色のスタイリッシュな白漆。現代の住空間やインテリアに調和する、洗練されたお道具。',
    color: '#fbf9f6',
    accentColor: '#cbaf87'
  }
];

export const CUSTOMERS: Customer[] = [
  {
    id: 'scholar',
    name: '歴史学者・関ヶ原先生',
    role: '伝統をこよなく愛する学者',
    avatar: '👨‍🏫',
    greeting: '「ふむ、本日のお茶席、非常に楽しみにしております。私好みの、ガツンと濃く、かつ作法にのっとった本格的なお茶を期待しておりますぞ。」',
    order: {
      matchaCups: 3,
      waterLevel: 'LOW',
      whiskType: 'PERFECT',
      serveRotation: 2
    },
    satisfiedSpeech: '「素晴らしい！まさに私が求めていた濃茶の深み！二回の回転による奥ゆかしさ！これこそ伝統の味です！」',
    neutralSpeech: '「ふむ……悪くありませんが、もう少し私のこだわりに寄り添っていただければ完璧でしたな。」',
    unsatisfiedSpeech: '「……おや。お湯が多すぎて薄いですし、作法もなっていません。これでは形だけの茶道になってしまいますな……。」',
    hint: '抹茶を多め（3杯）にし、お湯を少なめに止め、お茶碗を時計回りに2回まわしてお出しください。'
  },
  {
    id: 'tourist',
    name: '観光客・ジェシカさん',
    role: '日本文化を体験しに来た海外ゲスト',
    avatar: '👩‍遊',
    greeting: '「ハロー！茶道、初めてでとってもワクワクしマース！でも、あまりに苦いのはちょっとニガテね。マイルドでおいしいお茶、お願いしマース！」',
    order: {
      matchaCups: 1,
      waterLevel: 'HIGH',
      whiskType: 'PERFECT',
      serveRotation: 2
    },
    satisfiedSpeech: '「ワオ！とってもマイルドでクリーミー！泡がふわふわで、苦くなくてすごく美味しいデース！お茶碗を回すのもビューティフル！」',
    neutralSpeech: '「オゥ、少し私には苦かったデースが、これが本場の味ね！センキュー！」',
    unsatisfiedSpeech: '「オーマイガー……！すっごく苦くて熱くて、お茶碗も回さずにポンと出されてビックリしマース……涙」',
    hint: '抹茶を控えめ（1杯）にし、お湯をたっぷり注ぎ、丁寧にシャカシャカして、お茶碗を時計回りに2回まわしてお出しください。'
  },
  {
    id: 'businessman',
    name: '実業家・進藤社長',
    role: '分刻みのスケジュールをこなす経営者',
    avatar: '💼',
    greeting: '「申し訳ないが、次の会議まで時間がないんだ。作法だのなんだのという形式は抜きにして、標準の味のお茶を素早く出していただけるかな？」',
    order: {
      matchaCups: 2,
      waterLevel: 'MEDIUM',
      whiskType: 'LIGHT',
      serveRotation: 0
    },
    satisfiedSpeech: '「ありがたい！お茶碗を回す時間を省いて、すぐに差し出す臨機応変さ、お見事です！味もバッチリ、目が冴えました。では！」',
    neutralSpeech: '「お茶は美味しいですが、やはり少しお時間がかかりましたね。ビジネスはスピードが命です。」',
    unsatisfiedSpeech: '「時間はかかりますし、急いでいるのに丁寧にお茶碗をコトコト回されては、こちらの要望が伝わっていないと言わざるを得ません……。」',
    hint: '抹茶は普通（2杯）、お湯も中程度にし、軽く点てたら「お茶碗を回さずに（0回）」すばやく提供してください。'
  },
  {
    id: 'critic',
    name: '美食家・北大路さん',
    role: '数多の銘茶を飲み歩く食通',
    avatar: '🧔',
    greeting: '「私が愛するのは究極の『泡』だ。大きな雑な泡などお茶への冒涜。極限まで滑らかでクリーミーな泡を、完璧な作法で点てて見せよ。」',
    order: {
      matchaCups: 2,
      waterLevel: 'MEDIUM',
      whiskType: 'PERFECT',
      serveRotation: 2
    },
    satisfiedSpeech: '「お見事。この完璧なシルキー泡、舌の上で溶けるようです。作法も一寸の乱れもない。あなたのお点前、本物です。」',
    neutralSpeech: '「味は良いのですが、少し泡の表面に荒さが見られますな。あと一息といったところです。」',
    unsatisfiedSpeech: '「……話になりません。こんなに泡が荒く、抹茶とお湯の調和も不十分、これをお茶と呼ぶのはおこがましい。」',
    hint: '抹茶は2杯、お湯は中程度。シャカシャカしたあと、表面の大きな泡をタップで優しくすべて潰して整え、時計回りに2回回して出してください。'
  },
  {
    id: 'gal',
    name: 'ギャル茶人・るなちゃん',
    role: '茶道を楽しむ現役JKギャル',
    avatar: '💅',
    greeting: '「ヤバ！抹茶体験ウケる〜！うちは映え狙いだから、めっちゃ泡立っててクリーミー、お湯も抹茶もMAXマシマシで！作法とかだるいから、回さないでそのままでお願い！」',
    order: {
      matchaCups: 3,
      waterLevel: 'HIGH',
      whiskType: 'PERFECT',
      serveRotation: 0
    },
    satisfiedSpeech: '「マジ神！この泡もこもこ具合、超エモいし超映える〜！回さないですぐ出すのもタイパ最強！ガチ尊いお茶、あざっす！」',
    neutralSpeech: '「うーん、味はまぁまぁエモいけど、もっとガッツリ泡マシマシにして欲しかったかな〜！」',
    unsatisfiedSpeech: '「え、泡ぜんぜんないし、しかも回して出されるとかテンション下がるわ〜。超不完全燃焼なんですけど！」',
    hint: '抹茶を多め（3杯）にし、お湯もたっぷり注いで、丁寧に極細の泡がたつまでシャカシャカし、お茶碗を回さずに（0回）すぐにお出しください。'
  },
  {
    id: 'lady',
    name: 'お嬢様・琴音さま',
    role: 'おっとりした猫好きのご令嬢',
    avatar: '👩‍🦰',
    greeting: '「ごきげんよう。私は猫ちゃんのように温かく、ほんのり甘みの引き立つお茶が好みなの。お抹茶は控えめに1杯、お湯は中量。そして、そっと丁寧にまわして差し出していただける？」',
    order: {
      matchaCups: 1,
      waterLevel: 'MEDIUM',
      whiskType: 'LIGHT',
      serveRotation: 2
    },
    satisfiedSpeech: '「まあ……！猫舌の私にもちょうど良い優しさ。二回まわしのお作法も実に見事ですわ。とても優しく心地よい一時ですの。」',
    neutralSpeech: '「美味しいお茶ですわね。でも、ほんの少し濃かったかしら……ふふ。」',
    unsatisfiedSpeech: '「きゃっ、お茶がとても濃くて苦いですわ……。それに、お茶碗をそのまま差し出すなんて、少し驚いてしまいました。」',
    hint: '抹茶を少なめ（1杯）にし、お湯は中量。泡は軽く点てる（控えめ）にして、お茶碗を時計回りに2回まわしてお出しください。'
  },
  {
    id: 'storyteller',
    name: '落語家・千代丸師匠',
    role: '粋な下町のベテラン落語家',
    avatar: '👘',
    greeting: '「よう、ご亭主。野暮なことは言いっこなしだ。落語のあとで喉が渇いててね、お湯たっぷりでさらりと飲める、薄すぎねえお茶を頼むよ。そんで、お茶碗は粋にまわして出しておくれ。」',
    order: {
      matchaCups: 2,
      waterLevel: 'HIGH',
      whiskType: 'LIGHT',
      serveRotation: 2
    },
    satisfiedSpeech: '「うめえ！このさらりとした喉越し、速度のある二回まわしの所作。これこそ粋だねえ、ご亭主！」',
    neutralSpeech: '「いいお茶だ。だけどちと泡が立ちすぎてねえか？ 喉を潤すにはさらっとしてる方がいいんだがね。」',
    unsatisfiedSpeech: '「なんだい、これじゃあ泡だらけで口の周りが真っ白になっちまう。おまけに急いでいるのに回さねえなんて、野暮天極まりねえな。」',
    hint: '抹茶は普通（2杯）、お湯はたっぷり注いでください。泡は控えめに点て（シャカシャカを少なめ）、お茶碗を時計回りに2回まわしてお出しください。'
  },
  {
    id: 'engineer',
    name: 'ITエンジニア・サトシ',
    role: '徹夜明けで疲れ果てた開発者',
    avatar: '💻',
    greeting: '「あ、すいません……締め切り直前で丸二日寝てなくて。目の覚めるような超濃いお茶（抹茶3杯）、湯量は中量、そして激しく点てて（極細）、お茶碗は回さず（0回）に速攻でいただけますか……？ カフェインを、私に……」',
    order: {
      matchaCups: 3,
      waterLevel: 'MEDIUM',
      whiskType: 'PERFECT',
      serveRotation: 0
    },
    satisfiedSpeech: '「……！脳に直接カテキンが染み渡る……！この濃さと極細の泡、そして回さずすぐ出すスマートさ。これでバグが直せそうです。感謝します！」',
    neutralSpeech: '「あ、ありがとうございます。少し目が覚めました。でも、もう少し濃くても良かったかもしれません。」',
    unsatisfiedSpeech: '「うう、薄くて温くて、お茶碗まで丁寧に回されて……。私のデプロイが……間に合いません……パタッ」',
    hint: '抹茶を3杯、お湯は中量。極細の泡が立つまでよく点て、お茶碗は回さずに（0回）すぐにお出しください。'
  }
];
