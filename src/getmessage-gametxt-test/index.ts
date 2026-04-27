function extractGameTxtBlocks(input: string): string[] {
  const text = String(input || '');
  const matches = [...text.matchAll(/<gametxt>([\s\S]*?)<\/gametxt>/gi)];
  return matches.map(match => String(match[1] || '').trim()).filter(Boolean);
}

function checkLatestMessagesForGameTxt(): void {
  const messages = getChatMessages('-2-{{lastMessageId}}', {
    role: 'all',
    hide_state: 'all',
  });

  const latestTwo = messages.slice(-2);
  const found = latestTwo.some(message => extractGameTxtBlocks(message.message).length > 0);

  console.info('[getmessage-gametxt-test] latest two messages', latestTwo);

  if (found) {
    toastr.success('Found <gametxt> in getChatMessages()');
    return;
  }

  toastr.warning('Not found <gametxt> in getChatMessages()');
}

$(() => {
  checkLatestMessagesForGameTxt();
});
