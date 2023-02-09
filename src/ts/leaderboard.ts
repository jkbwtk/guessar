import { getVerboseUserFlags } from './AuthUtils';
import { UserFlags } from './types/auth';

const leaderboard = document.getElementById('gameLeaderboard') as HTMLDivElement;


let currentTarget: null | HTMLElement = null;


const clickActivate = (element: HTMLElement) => {
  element.classList.add('leaderboard-confirm-delete');
};

const clickDeactivate = (element: HTMLElement) => {
  element.classList.remove('leaderboard-confirm-delete');
};

const hoverActivate = (element: HTMLElement) => {
  element.classList.add('leaderboard-delete');
};

const deactivate = (element: HTMLElement) => {
  element.classList.remove('leaderboard-delete');
  clickDeactivate(element);
};

const deleteGame = async (element: HTMLElement) => {
  const id = element.getAttribute('gameid');
  if (id === null) return;

  const response = await fetch(`/api/v1/game/${id}/delete`, {
    method: 'DELETE',
  });

  if (response.status === 200) {
    window.location.reload();
  } else {
    deactivate(element);
  }
};


const user = getVerboseUserFlags();

if (user.has(UserFlags.MODERATOR)) {
  leaderboard.addEventListener('mousemove', (ev) => {
    if (ev.target instanceof HTMLElement) {
      if (!ev.target.classList.contains('leaderboard-item')) return;

      if (currentTarget !== null && currentTarget !== ev.target) {
        currentTarget.style.backgroundColor = 'initial';
        deactivate(currentTarget);
      }

      currentTarget = ev.target;
      hoverActivate(currentTarget);
    }
  });

  leaderboard.addEventListener('click', (ev) => {
    if (ev.target === currentTarget && currentTarget !== null) {
      if (currentTarget.classList.contains('leaderboard-confirm-delete')) {
        deleteGame(currentTarget);
      } else {
        clickActivate(currentTarget);
      }
    } else {
      if (currentTarget !== null) {
        deactivate(currentTarget);
      }
    }
  });
}
